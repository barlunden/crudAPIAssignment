const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const app = express();
const prisma = new PrismaClient();

const easyRouter = require("./tasks/easy");
const mediumRouter = require("./tasks/medium");
const hardRouter = require("./tasks/hard");

const PORT = 4009;

// Middleware to parse JSON
app.use(express.json());
app.use("/", easyRouter);
app.use("/", mediumRouter);
app.use("/", hardRouter);

app.get("/", (req, res) => {
  res.send(`Welcome to the Express server! You are looking for some API endpoints. They are listed below.
    1. /add-song - Add a song
    2. /get-songs - Get all songs
    3. /add-event - Add an event
    4. /get-events - Get all events
    5. /add-rsvp - Add an RSVP
    6. /get-rsvps/:eventId - Get RSVPs for a specific event
    7. /add-student - Add a student
    8. /assign-homework - Assign homework
    9. /update-assignment/:assignmentId - Updates an assignment
    10. /delete-assignment/:assignmentId - Deletes an assignment and the related completions
    11. /mark-completed - Marks an assignment as completed
    12. /completed-assignment/:assignmentId - Lists an assignment and the related completions`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
