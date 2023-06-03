import dotenv from 'dotenv';
import pkg from 'pg';
dotenv.config();
const { Client } = pkg;
const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PWD,
})

try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected");
    const res = await client.query('SELECT * FROM qb."Member"');
    console.log(res.rows[0]);
} catch (e) {
    console.log(`Error: ${e}`);
}
await client.end();