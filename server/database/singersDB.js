import pool from './database.js'

//Singers



//getAllSingers
export async function getAllSingers() {
    const [singers] = await pool.query(`select * from singers`);
    return singers;
}

//get singer
export async function getSingerById(id) {
    const [[singer]]=await pool.query(`select * from singers where singerId= ?`, [id])
    return singer
     
}


//get Singer by Id and password
export async function getSinger(name, pass) {
    const [[singer]] = await pool.query(`
    SELECT singers.* FROM singers
    JOIN passwords ON singers.singerId = passwords.singerId
    WHERE singers.singerName = ? AND passwords.password = ?
  `, [name, pass]);
    return singer;
}


//create new singer
export async function postSinger(newSinger) {
    const result = await pool.query(`insert into singers(singerName, singerPhone, pictureUrl, profile) VALUES (?, ?, ?, ?)`,
        [newSinger.singerName, newSinger.singerPhone, newSinger.pictureUrl, newSinger.profile]);
    return await getSingerById(result[0].insertId);
}

//delete password bySingerId
export async function deletePassword(id) {
    await pool.query(`DELETE FROM passwords WHERE singerId =?`, [id]);
}

//delete singer by Id
export async function deleteSinger(id) {
    await pool.query(`DELETE FROM singers WHERE singerId =?`, [id]);

}


// update singer 
export async function updateSinger(id, updSinger) {
    await pool.query(`
      UPDATE singers
      SET singerName = ?,
      singerPhone = ?,
      profile = ?,
      pictureUrl = ?
      WHERE singerId = ?
    `, [
      updSinger.singerName,
      updSinger.singerPhone,
      updSinger.profile,
      updSinger.pictureUrl,
      id
    ]);
  
    // לאחר העדכון, ביצוע שאילתה נוספת לקבלת פרטי הזמר המעודכנים
    const singer= await getSingerById(id)
    return singer;
  }
  



  // פונקציה לספירת זמרים
export async function countSingers() {
    const [[singer]] = await pool.query('SELECT COUNT(*) as count FROM singers');
    return singer.count; // החזרת מספר הזמרים
}

//קבלת הזמר הכי אהוב- שמעו אותו הכי הרבה פעמים
// Get the most played singer
export async function getMostPlayedSinger() {
  try {
      const [result] = await pool.query(`
          SELECT s.singerId, s.singerName, s.pictureUrl, COUNT(sp.songId) as totalPlays
          FROM songplays sp
          JOIN songs so ON sp.songId = so.songId
          JOIN singers s ON so.singerId = s.singerId
          GROUP BY s.singerId
          ORDER BY totalPlays DESC
          LIMIT 1
      `);
      return { success: true, singer: result[0] };
  } catch (error) {
      console.error('Error getting most played singer:', error);
      return { success: false, error };
  }
}

// Get password by singer ID
export async function getPasswordBySingerId(singerId) {
  const [[password]] = await pool.query(`SELECT password FROM passwords WHERE singerId = ?`, [singerId]);
  return password;
}

//create password
export async function postPass(singerId, password) {
await pool.query('INSERT INTO passwords(singerId,password) VALUES (?, ?)', [singerId,password]);
}

// Update password
export async function updatePassword(singerId, newPassword) {
  await pool.query(`UPDATE passwords SET password = ? WHERE singerId = ?`, [newPassword, singerId]);
}

// export async function getTopSinger() {
//     const [[singer]] = await pool.query(`
//         SELECT si.*, SUM(sp.playCount) as totalPlays
//         FROM singers si
//         JOIN songs s ON si.singerId = s.singerId
//         JOIN songplays sp ON s.songId = sp.songId
//         GROUP BY si.singerId
//         ORDER BY totalPlays DESC
//         LIMIT 1
//     `);
//     return singer;
// }