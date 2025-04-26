const { z, number, date } = require("zod");

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

// Validates the assignmentId parameter
// in the URL for the update and delete routes
// and the completedAssignment route
const assignmentParamSchema = z.object({
  assignmentId: z
    .string()
    .regex(/^\d+$/, "Invalid assignment ID format.")
    .transform((val) => Number(val)),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

const completedAssignmentSchema = z.object({
  assignmentId: z.union([
    z
      .string()
      .regex(/^\d+$/, "Invalid assignment ID format.")
      .transform(number),
    z.number().int().positive(),
  ]),
  studentId: z.union([
    z
      .string()
      .regex(/^\d+$/, "Invalid assignment ID format.")
      .transform(number),
    z.number().int().positive(),
  ]),
  dateCompleted: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

module.exports = {
  addStudentSchema,
  assignHomeworkSchema,
  assignmentParamSchema,
  updateAssignmentSchema,
  completedAssignmentSchema,
};
