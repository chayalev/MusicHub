import pool from './database.js';

//playlistSongs

//get playlistSongs by playlistId
export async function getPlaylistSongs(playlistId) {
    const [playlist] = await pool.query(`
    SELECT * FROM playlistsongs
    WHERE playlistId = ?
  `, [playlistId]);
    return playlist;
}

//create new playlist
export async function postPlaylistSong(newPlaylistSong) {
    await pool.query(`
    INSERT INTO playlistsongs(songId, playlistId)
    VALUES (?, ?)
  `, [newPlaylistSong.songId, newPlaylistSong.playlistId]);
    // return await getPlaylist(newPlaylist.playlistId);// זה בעיה שזה בהערה?
}

// delete playlist by Id
export async function deletePlaylistSong(songId,playlistId) {
    await pool.query(`
    DELETE FROM playlistsongs
    WHERE songId = ? AND playlistId=?
  `, [songId,playlistId]);
}

// delete all songs from a playlist
export async function deleteAllSongsFromPlaylist(playlistId) {
  await pool.query(`
  DELETE FROM playlistsongs
  WHERE playlistId = ?
`, [playlistId]);
}
