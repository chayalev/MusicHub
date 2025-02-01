import pool from './database.js';
import { format } from 'date-fns';

// Insert new song play
export async function addSongPlay(userId, songId, playDate) {
    try {
        const formattedDate = format(new Date(playDate), 'yyyy-MM-dd');
        
        const result = await pool.query(
            `INSERT INTO songplays (userId, songId, playDate) VALUES (?, ?, ?)`,
            [userId, songId, formattedDate]
        );
        return { success: true, insertId: result[0].insertId };
    } catch (error) {
        console.error('Error inserting song play:', error);
        return { success: false, error };
    }
}

// Delete all song plays by songId
export async function deleteSongPlaysBySongId(songId) {
    try {
        const result = await pool.query(
            `DELETE FROM songplays WHERE songId = ?`,
            [songId]
        );
        return { success: true, affectedRows: result[0].affectedRows };
    } catch (error) {
        console.error('Error deleting song plays:', error);
        return { success: false, error };
    }
}




// Get the most played song
//קבלת השיר הכי נשמע עי בדיקה בטבלת השמעות וטבלת שירים
export async function getMostPlayedSong() {
    try {
        const [result] = await pool.query(`
            SELECT so.songId, so.songName, so.pictureUrl, COUNT(sp.songId) as totalPlays
            FROM songplays sp
            JOIN songs so ON sp.songId = so.songId
            GROUP BY so.songId
            ORDER BY totalPlays DESC
            LIMIT 1
        `);
        return { success: true, song: result[0] };
    } catch (error) {
        console.error('Error getting most played song:', error);
        return { success: false, error };
    }
}
