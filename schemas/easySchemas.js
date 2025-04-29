const { z, number, date } = require("zod");

const addSongSchema = z.object({
  songName: z.string().min(2).max(100),
  artist: z.string().min(2).max(100),
  genre: z.string().min(2).max(50),
});

const songsArraySchema = z.array(addSongSchema);

module.exports = { addSongSchema, songsArraySchema };