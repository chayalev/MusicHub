import pool from './database.js'

//getAllTypes
export async function getAllTypes() {
    const [singers] = await pool.query(`select * from songtypes`);
    return singers;
}