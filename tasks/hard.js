const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const {
  addStudentSchema,
  assignHomeworkSchema,
  assignmentParamSchema,
  updateAssignmentSchema,
} = require("../schemas/hardSchemas");
const { validateBody } = require("../middleware/validationMiddleware");
const prisma = new PrismaClient();

const router = express.Router();

// Hard task - the Assignment and Completion models, plus the bonus Student model

// Student model
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
      res.send({ Success: "Assignment updated successfully", updatedAssignment });
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

router.delete(
  "/delete-assignment/:assignmentId",
  validateBody(assignmentParamSchema),
  async (req, res) => {
    const parseResult = assignmentParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid assignmentId" });
    }
    const assignmentId = parseInt(req.params.assignmentId, 10);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      return res
        .status(404)
        .json({ error: "This assignment ID does not exist." });
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });
    res.send({ Success: "Assignment deleted" });
  }
);

// Completion model
router.post("/mark-completed", async (req, res) => {
  const { studentId, assignmentId, dateCompleted, notes } = req.body;
  const completion = await prisma.completion.create({
    data: {
      studentId,
      assignmentId,
      dateCompleted: new Date(dateCompleted),
      notes,
    },
  });
  res.send({ Success: "Assignment completed", completion });
});

router.get("/completed-assignment/:assignmentId", async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId, 10);
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
  res.send(completions);
});

module.exports = router;
