// This file contains the endpoints for the Medium assignment

const express = require("express");
const { Prisma, PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const {
  addEventSchema,
  eventArraySchema,
  addRsvpSchema,
  rsvpParamSchema,
} = require("../schemas/mediumSchemas");

const { validateBody } = require("../middleware/validationMiddleware");
const prisma = new PrismaClient();

const router = express.Router();

// the Event and RSPV models

// Event model
router.post("/add-event", validateBody(addEventSchema), async (req, res) => {
  const { eventName, description, date } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        eventName,
        description,
        date: new Date(date),
      },
    });
    res.send({ Success: "Event added successfully", event });
  } catch (e) {
    console.error("Error caught:", e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return res.status(409).json({
        error: "An event with this name already exists.",
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-events", async (req, res) => {
  const events = await prisma.event.findMany();
  try {
    const formattedEvents = events.map((event) => ({
      ...event,
      date:
        event.date instanceof Date
          ? event.date.toISOString().slice(0, 10)
          : event.date,
    }));
    res.json(eventArraySchema.parse(formattedEvents));
  } catch (e) {
    res.status(400).json({ error: "Validation failed", details: e.errors });
  }
});

// RSVP model
router.post("/add-rsvp", validateBody(addRsvpSchema), async (req, res) => {
  const rsvpData = req.body;

  const eventExists = await prisma.event.findUnique({
    where: { id: rsvpData.eventId },
  });
  if (!eventExists) {
    return res.status(404).json({ error: "Event not found" });
  }

  const existingRSVP = await prisma.rSVP.findUnique({
    where: {
      eventId_email: {
        eventId: rsvpData.eventId,
        email: rsvpData.email,
      },
    },
  });

  if (existingRSVP) {
    return res
      .status(409)
      .json({
        error: "You have already registered for this event with this email.",
      });
  }

  try {
    const rsvp = await prisma.rSVP.create({
      data: {
        userName: rsvpData.userName,
        email: rsvpData.email,
        attendance: rsvpData.attendance,
        event: {
          connect: { id: rsvpData.eventId },
        },
      },
    });
    res.status(201).json({
      Success: "RSVP added successfully",
      rsvp: `${rsvp.userName} says ${rsvp.attendance} to this event!`,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return res
        .status(409)
        .json({
          error: "You have already registered for this event with this email.",
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-rsvps/:eventId", async (req, res) => {
  const parseResult = rsvpParamSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.errors });
  }

  const eventId = parseInt(req.params.eventId, 10);
  try {
    const rsvps = await prisma.rSVP.findMany({
      where: { eventId: eventId },
    });
    if (!rsvps) {
      return res.status(404).json({ error: "No RSVPs found for this event" });
    }
    res.send(rsvps);
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
