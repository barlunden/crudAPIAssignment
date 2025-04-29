// This file contains the endpoints for the Hard assignment

const express = require("express");
const { Prisma, PrismaClient } = require("@prisma/client");
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

// /add-student
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

// /assign-homework
router.post(
  "/assign-homework",
  validateBody(assignHomeworkSchema),
  async (req, res) => {
    let { assignmentId, assignment, studentIds } = req.body;

    try {
      if (!assignmentId && assignment) {
        const existing = await prisma.assignment.findFirst({
          where: {
            title: assignment.title,
            description: assignment.description,
            dueDate: new Date(assignment.dueDate),
          },
        });
        if (existing) {
          assignmentId = existing.id;
        } else {
          const created = await prisma.assignment.create({
            data: {
              title: assignment.title,
              description: assignment.description,
              dueDate: new Date(assignment.dueDate),
            },
          });
          assignmentId = created.id;
        }
      }

      if (!assignmentId) {
        return res
          .status(400)
          .json({ error: "assignmentId is missing and can't be created." });
      }

      const existingLinks = await prisma.studentAssignment.findMany({
        where: {
          assignmentId,
          studentId: { in: studentIds },
        },
        select: { studentId: true },
      });
      const alreadyAssignedIds = existingLinks.map((link) => link.studentId);

      const newStudentIds = studentIds.filter(
        (id) => !alreadyAssignedIds.includes(id)
      );
      if (newStudentIds.length === 0) {
        return res
          .status(409)
          .json({ error: "All students are assigned to this task" });
      }

      const result = await prisma.studentAssignment.createMany({
        data: newStudentIds.map((studentId) => ({
          studentId,
          assignmentId,
        })),
      });

      res.status(201).json({
        success: "Assignment assigned!",
        assignmentId,
        assignedCount: result.count,
        skipped: alreadyAssignedIds,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return res
          .status(409)
          .json({
            error: "One or more students are already assigned to this task.",
          });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// /update-assignment/:assignmentId
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

// /delete-assignment/:assignmentId
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

// /mark-completed
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

// /completed-assignment/:assignmentId
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
      res.status(201).json({
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
