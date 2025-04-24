const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

const router = express.Router();

// Hard task - the Assignment and Completion models
// Student model
const addStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email({ error: "Use a valid email address." }),
});

router.post("/add-student", async (req, res) => {
  const studentData = req.body;
  const parseResult = addStudentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }

  const student = await prisma.student.create({
    data: {
      name: studentData.name,
      email: studentData.email,
    },
  });
  res.send({ Success: "Student added successfully", student });
});

// Assignment model
const assignHomeworkSchema = z.object({
  assignment: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    dueDate: z.string().datetime(),
  }),
  studentIds: z.array(z.number().int().positive()).min(1),
});

router.post("/assign-homework", async (req, res) => {
  const { assignment, studentIds } = req.body;
  const parseResult = assignHomeworkSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }

  const newAssignment = await prisma.assignment.create({
    data: {
      ...assignment,
      students: {
        connect: studentIds.map((id) => ({ id })),
      },
    },
  });
  res.send({
    Success: "Assignment added successfully",
    newAssignment,
    studentIds,
  });
});

router.patch("/update-assignment/:assignmentId", async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId, 10);
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    return res
      .status(404)
      .json({ error: "This assignment ID does not exist." });
  }

  const data = req.body;
  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data,
  });
  res.send({ Success: "Assignment updated", updated });
});

const assignmentParamSchema = z.object({
  assignmentId: z.string().regex(/^\d+$/),
});

router.delete("/delete-assignment/:assignmentId", async (req, res) => {
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
});

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