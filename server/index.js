import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import singers from './index/singers.js';
import songs from './index/songs.js';
import types from'./index/types.js';
import users from './index/users.js'
import playlistSongs from './index/playlistSongs.js'
import songPlay from './index/songPlay.js'
import comments from './index/comments.js'
import playlist from './index/playlist.js'

import dotenv from "dotenv";
dotenv.config();


const app = express();
const PORT = 8080;

// הגדרת __dirname עבור מודולי ES
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

// הגדרת קבצים סטטיים
app.use('/uploads', express.static(path.join(__dirname, 'index/uploads')));
app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/singers', singers);
app.use('/types', types);
app.use('/users', users);
app.use('/playlistSongs',playlistSongs);
app.use('/songs',songs);
app.use('/songplays',songPlay);
app.use('/comments',comments);
app.use('/playlists',playlist);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
