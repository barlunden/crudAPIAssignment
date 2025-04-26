// This file contains the hard task routes for the assignment and completion models
// and the bonus student model.
// It includes routes for adding a student, assigning homework, updating assignments,
// deleting assignments, marking assignments as completed, and retrieving completions.
// It uses Prisma as the ORM to interact with the database and Zod for validation.
// It also includes error handling for various scenarios, such as duplicate entries,
// invalid IDs, and missing required fields.

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

// Importing the validation middleware
const {
  addStudentSchema,
  assignHomeworkSchema,
  assignmentParamSchema,
  updateAssignmentSchema,
  completedAssignmentSchema,
} = require("../schemas/hardSchemas");

// Importing the validation middleware
const {
  validateBody,
  validateParams,
} = require("../middleware/validationMiddleware");
const prisma = new PrismaClient();

const router = express.Router();

// Student model

// This route adds a student to the database
// It expects a student object in the request body
// The student object should contain the name and email
// The email should be unique
router.post(
  "/add-student",
  validateBody(addStudentSchema),
  async (req, res) => {
    const studentData = req.body;
    const parseResult = addStudentSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    try {
      student = await prisma.student.create({
        data: {
          name: studentData.name,
          email: studentData.email,
        },
      });
    } catch (e) {
      if (e.code === "P2002") {
        return res.status(400).json({
          error: "A student with this email already exists.",
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
    res.send({ Success: "Student added successfully", student });
  }
);

// Assignment model

// This route assigns homework to students
// and creates an assignment in the database
// It expects an assignment object and an array of student IDs
// in the request body
// The assignment object should contain the title, description, and due date
// The student IDs should be an array of integers
router.post(
  "/assign-homework",
  validateBody(assignHomeworkSchema),
  async (req, res) => {
    const { assignment, studentIds } = req.body;
    const parseResult = assignHomeworkSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    try {
      assignment = await prisma.assignment.create({
        data: {
          ...assignment,
          students: {
            connect: studentIds.map((id) => ({ id })),
          },
        },
      });
    } catch (e) {
      if (e.code === "P2025") {
        return res.status(404).json({
          error: "One or more student IDs do not exist.",
        });
      }

      res.send({
        Success: "Assignment added successfully",
        assignment,
        studentIds,
      });
    }
  }
);

// This route updates an assignment in the database
// It expects an assignment ID in the URL and an assignment object
// in the request body
// The assignment object could contain the title, description, and due date
// and should only update the fields that are provided
// The assignment ID should be a positive integer
// If the assignment ID does not exist, it returns a 404 error
// If the assignment ID exists, it updates the assignment and returns the updated assignment
router.patch(
  "/update-assignment/:assignmentId",
  validateBody(updateAssignmentSchema),
  async (req, res) => {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    const updateData = req.body;

    try {
      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: updateData,
      });
      res.send({
        Success: "Assignment updated successfully",
        updatedAssignment,
      });
    } catch (e) {
      if (e.code === "P2025") {
        return res.status(404).json({
          error: "This assignment ID does not exist.",
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// This route deletes an assignment from the database
// It expects an assignment ID in the URL
// If the assignment ID does not exist, it returns a 404 error
// If the assignment ID exists, it deletes the assignment and returns a success message
router.delete(
  "/delete-assignment/:assignmentId",
  validateParams(assignmentParamSchema),
  async (req, res) => {
    const assignmentId = req.params.assignmentId;

    try {
      await prisma.assignment.delete({
        where: { id: assignmentId },
      });
      res.send({ Success: "Assignment deleted successfully" });
    } catch (e) {
      if (e.code === "P2025") {
        return res.status(404).json({
          error: "This assignment ID does not exist.",
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Completion model

// This route marks an assignment as completed by a student
// It expects a student ID and an assignment ID in the request body
// It also expects a dateCompleted and optional notes
// The student ID and assignment ID should be positive integers
// If the assignment ID does not exist, it returns a 404 error
// If the student ID does not exist, it returns a 404 error
// If the assignment has already been marked as completed by this student,
// it returns a 400 error
// If the assignment and student IDs are valid, it creates a completion
// and returns a success message
router.post(
  "/mark-completed",
  validateBody(completedAssignmentSchema),
  async (req, res) => {
    const { studentId, assignmentId } = req.body;

    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });
      if (!assignment) {
        return res
          .status(404)
          .json({ error: "This assignment ID does not exist." });
      }
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!student) {
        return res
          .status(404)
          .json({ error: "This student ID does not exist." });
      }

      const existingCompletion = await prisma.completion.findUnique({
        where: {
          studentId_assignmentId: {
            studentId,
            assignmentId,
          },
        },
      });
      if (existingCompletion) {
        return res.status(400).json({
          error:
            "This assignment has already been marked as completed by this student.",
        });
      }
      const completion = await prisma.completion.create({
        data: {
          studentId,
          assignmentId,
          dateCompleted: new Date(),
          notes: req.body.notes,
        },
      });
      res.send({
        Success: "Assignment marked as completed successfully",
        completion,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// This route retrieves all completions for a specific assignment
router.get(
  "/completed-assignment/:assignmentId",
  validateParams(assignmentParamSchema),
  async (req, res) => {
    const { assignmentId } = req.params;
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        return res
          .status(404)
          .json({ error: "This assignment ID does not exist." });
      }

      const completions = await prisma.completion.findMany({
        where: { assignmentId },
        include: { student: true },
      });

      if (completions.length === 0) {
        return res.status(200).json({
          error: "No completions found for this assignment.",
        });
      }

      const result = completions.map((completion) => ({
        studentId: completion.studentId,
        studentName: completion.student.name,
        dateCompleted: completion.dateCompleted,
        notes: completion.notes,
      }));
      res.send({
        Success: "Completions retrieved successfully",
        assignment: assignment.assignmentName,
        completions: result,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
