const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

const router = express.Router();

// Easy task - the Song model
router.post("/add-song", async (req, res) => {
    const songData = req.body;
  
    if (!songData.songName || !songData.artist || !songData.genre) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const song = await prisma.song.create({
      data: {
        songName: songData.songName,
        artist: songData.artist,
        genre: songData.genre,
      },
    });
    res.send({ Success: "Song added successfully", song });
  });
  
  router.get("/get-songs", async (req, res) => {
    const songs = await prisma.song.findMany();
    res.send(songs);
  });
  
  module.exports = router;