import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllSongs, getAllSongsBySinger, getSong, postSong, deleteSong, updateSong, addLikeToSong, deleteSongFromPlaylists, getTopPlayedSongLastWeek, getMostLikedSongBySinger, getMostPlayedSongBySinger, countSongs } from '../database/songsDB.js';
import { deleteSongPlaysBySongId } from '../database/songPlayDB.js'
import { deleteCommentsBySongId } from '../database/commentsDB.js'
import Joi from 'joi';
import { log } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const route = express.Router();
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Joi schema for song validation
const songSchema = Joi.object({
  songName: Joi.string().required(),
  description: Joi.string().required(),
  typeId: Joi.required(),
  singerId: Joi.required(),
  uploadDate: Joi.date(),
  likes: Joi.required(),
  songLink: Joi.string().regex(/\.mp3$/).required(),
  pictureUrl: Joi.any()
});

route.get('/', async (req, res) => {
  try {
    const songs = await getAllSongs();
    if (!songs) {
      return res.sendStatus(404);
    }
    res.send(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const song = await getSong(id);
    if (!song) {
      return res.sendStatus(404);
    }
    res.send(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get('/singer/:singerId', async (req, res) => {
  try {
    const singerId = req.params.singerId;
    const songs = await getAllSongsBySinger(singerId);
    if (!songs) {
      return res.sendStatus(404);
    }
    res.send(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.post('/', upload.fields([{ name: 'picture', maxCount: 1 }, { name: 'songLink', maxCount: 1 }]), async (req, res) => {
  try {
    const newSong = req.body;
    if (req.files) {
      console.log("req.files",req.files);
      
      if (req.files.picture) {
        newSong.pictureUrl = '/uploads/' + req.files.picture[0].filename;
      } else {
        newSong.pictureUrl = '/uploads/default.png'; // Set default image
      }
      if (req.files.songLink) {
        newSong.songLink = '/uploads/' + req.files.songLink[0].filename;
      }
    }
    newSong.uploadDate = new Date();

    // Validate the incoming data using JOI schema
    const { error } = songSchema.validate(newSong);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const createdSong = await postSong(newSong);
    res.status(201).send(createdSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(400).json({ message: error.message });
  }
});


route.put('/:id', upload.fields([{ name: 'picture', maxCount: 1 }, { name: 'songLink', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const existingSong = await getSong(id);
    const updatedSong = req.body;

    if (req.files) {
      if (req.files.picture && req.files.picture.length > 0) {
        updatedSong.pictureUrl = '/uploads/' + req.files.picture[0].filename;
      } else {
        updatedSong.pictureUrl = existingSong.pictureUrl; // שמור את התמונה הקיימת
      }

      if (req.files.songLink && req.files.songLink.length > 0) {
        updatedSong.songLink = '/uploads/' + req.files.songLink[0].filename;
      } else {
        updatedSong.songLink = existingSong.songLink; // שמור את הקובץ הקיים
      }
    } else {
      updatedSong.pictureUrl = existingSong.pictureUrl; // שמור את התמונה הקיימת
      updatedSong.songLink = existingSong.songLink; // שמור את הקובץ הקיים
    }

    // Validate the incoming data using JOI schema
    const { error } = songSchema.validate(updatedSong);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await updateSong(id, updatedSong);
    res.status(200).json({ message: 'Song updated successfully' });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(400).json({ message: error.message });
  }
});


route.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deleteSongPlaysBySongId(id)
    await deleteSongFromPlaylists(id);
    await deleteCommentsBySongId(id)
    await deleteSong(id);
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.put('/:songId/addLike', async (req, res) => {
  try {
    const songId = req.params.songId;
    await addLikeToSong(songId);
    res.status(200).json({ message: 'Song liked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get('/top/all/:singerId', async (req, res) => {
  try {
    const { singerId } = req.params;
    const [topSong, mostLikedSong, mostPlayedSong] = await Promise.all([
      getTopPlayedSongLastWeek(singerId),
      getMostLikedSongBySinger(singerId),
      getMostPlayedSongBySinger(singerId)
    ]);
    res.json({ topSong, mostLikedSong, mostPlayedSong });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to count songs
route.get('/count/:userId', async (req, res) => {
  try {
    const songCount = await countSongs();
    res.json({ count: songCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default route;


