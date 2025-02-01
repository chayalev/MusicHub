
//conect to sql database
import mySql from "mysql2"
const pool = mySql.createPool({
    host: "127.0.0.1",
    password: "Chayale1",
    user: 'root',
    database: 'musicdb'
}).promise();


export default pool;














