

import pool from './database.js'

//songs



//getAllSongsBySinger עם שמות הזמרים והסוגים לפי זמר
export async function getAllSongsBySinger(singerId) {
    const [songs] = await pool.query(`
      SELECT s.*, si.singerName, st.typeName
      FROM songs s
      JOIN singers si ON s.singerId = si.singerId
      JOIN songtypes st ON s.typeId = st.typeId
      WHERE s.singerId = ?
    `, [singerId]);
    return songs;
}
  

//getAllSongsByType
export async function getAllSongsByType(typeId) {
    const [song] = await pool.query(`select * from songs where typeId= ?`, [typeId]);
    return song;
}


// פונקציה שמחזירה את כל השירים כולל שם הזמר והסוג
export async function getAllSongs() {
    const [songs] = await pool.query(`
      SELECT s.*, si.singerName, st.typeName
      FROM songs s
      JOIN singers si ON s.singerId = si.singerId
      JOIN songtypes st ON s.typeId = st.typeId
    `);
    return songs;
}



// פונקציות אחרות
export async function getSong(songId) {
    const [[song]] = await pool.query(`
      SELECT s.*, si.singerName, st.typeName
      FROM songs s
      JOIN singers si ON s.singerId = si.singerId
      JOIN songtypes st ON s.typeId = st.typeId
      WHERE s.songId = ?
    `, [songId]);
    return song;
}



//create new song
export async function postSong(newSong) {
    const result = await pool.query(`insert into songs(songName,description,typeId,singerId,uploadDate,songLink,pictureUrl,likes) VALUES(?,?,?,?,?,?,?,?)`,
        [newSong.songName, newSong.description, newSong.typeId, newSong.singerId,newSong.uploadDate,newSong.songLink,newSong.pictureUrl,newSong.likes])
    return await getSong(result[0].insertId);

}

//delete song by Id
export async function deleteSong(id) {
    await pool.query(`DELETE FROM songs WHERE songId =?`, [id]);

}

//delete song from Playlist
export async function deleteSongFromPlaylists(id) {
    await pool.query(`DELETE FROM playlistsongs WHERE songId =?`, [id]);
}

//update song 
export async function updateSong(id, updSong) {
    await pool.query(`
        UPDATE songs
        SET songName = ?,
            description = ?,
            typeId = ?,
            singerId = ?,
            songLink = ?,
            pictureUrl = ?,
            likes = ?
        WHERE songId = ?
    `, [
        updSong.songName,
        updSong.description,
        updSong.typeId,
        updSong.singerId,
        updSong.songLink,
        updSong.pictureUrl,
        updSong.likes,
        id,
    ]);
}

export async function addLikeToSong(songId) {
    await pool.query(`
      UPDATE songs
      SET likes = likes + 1
      WHERE songId = ?
    `, [songId]);
  }

// לפי טבלת שירים טבלת השמעות מהסוף להתחלה- פונקציה שמחזירה את  השיר הכי מושמע בשבוע האחרון לפי זמר
export async function getTopPlayedSongLastWeek(singerId) {
  const [songs] = await pool.query(`
    SELECT s.*, COUNT(sp.songId) as plays
    FROM songs s
    JOIN songplays sp ON s.songId = sp.songId
    WHERE sp.playDate >= DATE_SUB(NOW(), INTERVAL 1 WEEK) AND s.singerId = ?
    GROUP BY sp.songId
    ORDER BY plays DESC
    LIMIT 1
  `, [singerId]);
  return songs.length ? songs[0] : null;
}

//השיר הכי אהוב לפי לייקים
export async function getMostLikedSongBySinger(singerId) {
  const [songs] = await pool.query(`
    SELECT *
    FROM songs
    WHERE singerId = ?
    ORDER BY likes DESC
    LIMIT 1
  `, [singerId]);
  return songs.length ? songs[0] : null;
}

//הכי נשמע בכללי
export async function getMostPlayedSongBySinger(singerId) {
  const [songs] = await pool.query(`
    SELECT s.*, COUNT(sp.songId) as plays
    FROM songs s
    JOIN songplays sp ON s.songId = sp.songId
    WHERE s.singerId = ?
    GROUP BY sp.songId
    ORDER BY plays DESC
    LIMIT 1
  `, [singerId]);
  return songs.length ? songs[0] : null;
}

//השיר של הזמר המבוקש שנמצא בהכי הרבה פליליסטים
export async function getMostInPlaylistsSongBySinger(singerId) {
  const [songs] = await pool.query(`
    SELECT s.*, COUNT(ps.playlistId) as in_playlists
    FROM songs s
    JOIN playlistsongs ps ON s.songId = ps.songId
    WHERE s.singerId = ?
    GROUP BY s.songId
    ORDER BY in_playlists DESC
    LIMIT 1
  `, [singerId]);
  return songs.length ? songs[0] : null;
}

// פונקציה לספירת שירים
export async function countSongs() {
  const [[song]] = await pool.query('SELECT COUNT(*) as count FROM songs');
  return song.count; // החזרת מספר השירים
}