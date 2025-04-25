const { z } = require("zod");

// Student model
const addStudentSchema = z.object({
  name: z.string().min(2).max(30),
  email: z.string().email({ error: "Use a valid email address." }),
});

// Assignment model
const assignHomeworkSchema = z.object({
  assignment: z.object({
    title: z.string().min(2).max(100),
    description: z.string().min(5).max(1000),
    dueDate: z.string().datetime(),
  }),
  studentIds: z.array(z.number().int().positive()).min(1),
});

const assignmentParamSchema = z.object({
  assignmentId: z.string().regex(/^\d+$/),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

module.exports = {
  addStudentSchema,
  assignHomeworkSchema,
  assignmentParamSchema,
  updateAssignmentSchema,
};
