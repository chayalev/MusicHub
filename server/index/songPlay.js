import express from 'express';
import { addSongPlay, getMostPlayedSong } from '../database/songPlayDB.js';
import { getMostPlayedSinger} from '../database/singersDB.js'
const route = express.Router();

// Add new song play
route.post('/', async (req, res) => {
    const { userId, songId, playDate } = req.body;
   
    if (!songId || !playDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
 
    try {
        const result = await addSongPlay(userId, songId, playDate);
        if (result.success) {
            res.status(200).json({ message: 'Song play recorded successfully', insertId: result.insertId });
        } else {
            res.status(500).json({ error: 'Failed to record song play', details: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred', details: error });
    }
});

// Get the most played singer and song
route.get('/most-played', async (req, res) => {
    try {
        const [singerResult, songResult] = await Promise.all([getMostPlayedSinger(), getMostPlayedSong()]);
        if (singerResult.success && songResult.success) {
            res.status(200).json({
                mostPlayedSinger: singerResult.singer,
                mostPlayedSong: songResult.song
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to retrieve most played data', 
                details: { singerError: singerResult.error, songError: songResult.error } 
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred', details: error });
    }
});


export default route;
