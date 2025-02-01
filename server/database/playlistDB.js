import pool from './database.js';

//playlists

//get playlist by Id
export async function getPlaylist(playlistId) {
  const [[playlist]] = await pool.query(`
    SELECT * FROM playlists
    WHERE playlistId = ?
  `, [playlistId]);
  return playlist;
}


// postPlaylist function
export async function postPlaylist(newPlaylist, source) {
  try {
    if (source !== 'postUser' && newPlaylist.playlistName === 'השירים שאהבתי') {
      throw new Error('שם הפלייליסט "השירים שאהבתי" לא ניתן לשימוש');
    }

    const result = await pool.query(`
          INSERT INTO playlists(playlistName, userId, isPublic)
          VALUES (?, ?, ?)
      `, [newPlaylist.playlistName, newPlaylist.userId, newPlaylist.isPublic]);

    return await getPlaylist(result[0].insertId);

  } catch (error) {
    console.error('Error in postPlaylist:', error);
    throw error;
  }
}


//delete playlist by Id
export async function deletePlaylist(playlistId) {
  await pool.query(`
    DELETE FROM playlists
    WHERE playlistId = ?
  `, [playlistId]);
}

//update playlist 
export async function updatePlaylist(updPlaylist) {
  try {
    if (updPlaylist.playlistName === 'השירים שאהבתי') {
      throw new Error('שם הפלייליסט "השירים שאהבתי" לא ניתן לשימוש');
    }
    await pool.query(`
      UPDATE playlists
      SET playlistName = ?, isPublic = ?
      WHERE playlistId = ?
    `, [updPlaylist.playlistName, updPlaylist.isPublic, updPlaylist.playlistId]);
  }
  catch (error) {
    throw error;
  }
}



//get all playlists by userId
export async function getAllPlaylistsByUserId(userId) {
  const [playlists] = await pool.query(`
    SELECT * FROM playlists
    WHERE userId = ?
  `, [userId]);
  return playlists;
}

//קבלת כל הפליליסטים הציבוריים שלא שייכים למשתמש
export async function getAllPublicPlaylists(userId) {
  const [playlists] = await pool.query(`
    SELECT playlists.*, users.userName AS creatorName 
    FROM playlists
    JOIN users ON playlists.userId = users.userId
    WHERE playlists.isPublic = true AND playlists.userId != ?
  `, [userId]);
  return playlists;
}


//add Like To playlist
export async function addLikeToPlaylist(playlistId) {
  await pool.query(`
    UPDATE playlists
    SET likes = likes + 1
    WHERE playlistId = ?
  `, [playlistId]);
}