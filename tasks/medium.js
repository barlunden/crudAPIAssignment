const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

const router = express.Router();

// Medium task - the Event and RSPV models
// Event model
router.post("/add-event", async (req, res) => {
  const eventData = req.body;

  if (!eventData.eventName || !eventData.description || !eventData.date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const event = await prisma.event.create({
    data: {
      eventName: eventData.eventName,
      description: eventData.description,
      date: new Date(eventData.date),
    },
  });
  res.send({ Success: "Event added successfully", event });
});

router.get("/get-events", async (req, res) => {
  const events = await prisma.event.findMany();
  res.send(events);
});

// RSVP model
router.post("/add-rsvp", async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const rsvpData = req.body;
  const validAttendanceStatuses = ["GOING", "MAYBE", "NOT_GOING"];
  const eventExists = await prisma.event.findUnique({
    where: { id: rsvpData.eventId },
  });

  if (!validAttendanceStatuses.includes(rsvpData.attendance)) {
    return res.status(400).json({
      error: `Invalid attendance status. Allowed values are: ${validAttendanceStatuses.join(", ")}`,
    });
  }

  if (!rsvpData.userName || !rsvpData.email || !rsvpData.eventId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!eventExists) {
    return res.status(404).json({ error: "Event not found" });
  }

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
  res.send({
    Success: "RSVP added successfully",
    rsvp: `${rsvp.userName} says ${rsvp.attendance} to this event!`,
  });
});

router.get("/get-rsvps/:eventId", async (req, res) => {
  const eventId = parseInt(req.params.eventId);

  const rsvps = await prisma.rSVP.findMany({
    where: { eventId: eventId },
  });

  if (rsvps.length === 0) {
    return res.status(404).json({ error: "No RSVPs found for this event" });
  }

  res.send(rsvps);
});

module.exports = router;
