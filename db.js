import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const createClient = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PWD,
    })

    try {
        await client.connect();
    } catch (e) {
        console.log(`Error: ${e}`);
    }

    return client;
}

export { createClient };