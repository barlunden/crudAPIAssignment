const express = require("express");
const { Prisma, PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const { addSongSchema, songsArraySchema } = require("../schemas/easySchemas");

// Importing the validation middleware
const { validateBody } = require("../middleware/validationMiddleware");
const prisma = new PrismaClient();

const router = express.Router();

// Easy task - the Song model
router.post("/add-song", validateBody(addSongSchema), async (req, res) => {
  const { songName, artist, genre } = req.body;

  try {
    const song = await prisma.song.create({
      data: {
        songName,
        artist,
        genre,
      },
    });
    res.send({ Success: "Song added successfully", song });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return res.status(409).json({
        error: "A song with this name already exists.",
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-songs", async (req, res) => {
  const songs = await prisma.song.findMany();

  try {
    const validatedSongs = songsArraySchema.parse(songs);
    res.send(validatedSongs);
  } catch (e) {
    res.status(400).json({ error: "Validation failed", details: e.errors });
  }
});

module.exports = router;
