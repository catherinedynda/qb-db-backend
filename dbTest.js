import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();
const { Client } = pkg;
// const client = new Client({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     database: process.env.DB_DATABASE,
//     password: process.env.DB_PWD,
// });
const connectionString = process.env.CONNECTION_STRING;
const client = new Client({ connectionString });
import { createKnex } from "./db.js";

try {
    console.log("Connecting...");
    await client.connect();
    // const knex = await createKnex();
    console.log("Connected");
    // const test = null;
    // const res = await knex
    //     .withSchema("qb")
    //     .select()
    //     .from("Member")
    //     .where("name", "like", `%${test}`);
    // console.log(res);
    // await knex.destroy();
    const res = await client.query('SELECT * FROM qb."Member"');
    console.log(res.rows[0]);
    //   const res = await client.query('SELECT * FROM qb."nickname_setup" LIMIT 5');
    //   console.log(res.rows[0].nickname_id);
    // const res = await client.query(
    //   'SELECT * FROM qb."Member" WHERE member_id = $1 AND groupme_name = $2',
    //   [21573506, "Gillian Haenggi"]
    // );
    // console.log(res.rows);
} catch (e) {
    console.log(`Error: ${e}`);
}
await client.end();
