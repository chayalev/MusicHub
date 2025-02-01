import pool from './database.js'

//users

//getAllSingers
export async function getAllUsers() {
    const [users] = await pool.query(`select * from users`);
    return users;
}

//get user by Id and password
export async function getUser(userName ,email) {
    const [[user]] = await pool.query(`
    SELECT * FROM users
    WHERE userName = ? AND email = ?
  `, [userName, email]);
  console.log("user",user);
    return user;
}


//create new user
export async function postUser(newUser) {
    await pool.query(`INSERT INTO users(userName, email) VALUES(?, ?)`,
        [newUser.userName, newUser.email])
    return await getUser(newUser.userId);
}

//delete user by Id
export async function deleteUser(id) {
    await pool.query(`DELETE FROM users WHERE userId = ?`, [id]);
}

//update user 
export async function updateUser(updUser) {
    await pool.query(`
    UPDATE users
        SET userName = ?,
        email = ?      
    WHERE userId = ?
`, [
        updUser.userName,
        updUser.email,
        updUser.userId
    ]);
}
// פונקציה לספירת משתמשים
export async function countUsers() {
    const [[user]] = await pool.query('SELECT COUNT(*) as count FROM users');
    return user.count; // החזרת מספר המשתמשים
}
