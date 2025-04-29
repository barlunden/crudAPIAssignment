const { z, number, date } = require("zod");

const addEventSchema = z.object({
    eventName: z.string().min(2).max(50),
    description: z.string().min(10).max(200),
    date: z.string().date(),
});

const eventArraySchema = z.array(addEventSchema);

const attendanceStatusEnum = z.enum(["GOING", "MAYBE", "NOT_GOING"])

const addRsvpSchema = z.object({
    eventId: z.number().int().positive(),
    userName: z.string().min(1),
    email: z.string().email({ error: "Use a valid email address." }),
    attendance: attendanceStatusEnum

})

const rsvpParamSchema = z.object({
    eventId: z
      .string()
      .regex(/^\d+$/, "Invalid assignment ID format.")
  });

module.exports = { addEventSchema, eventArraySchema, addRsvpSchema, rsvpParamSchema };