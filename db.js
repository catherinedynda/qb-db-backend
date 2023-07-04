import pkg from "pg";
import knex from "knex";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

// note: maybe when/if you switch providers, have a separate read-only and one that has read/write capabilities?
// so there isn't any chance of the frontend messing things up

const createClient = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PWD,
    });

    let count = 0;
    while (count < 5) {
        try {
            await client.connect();
            break;
        } catch (e) {
            console.log("failed, trying again");
            count++;
            // sleep(3000);
        }
    }

    return client;
};

const createKnex = async () => {
    const knexClient = knex({
        client: "pg",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PWD,
        },
    });

    return knexClient;
};

// safely deletes a quote and associated items
const deleteQuote = async (quote_id, client) => {
    try {
        await client.query('DELETE FROM qb."Like" WHERE quote_id = $1', [
            quote_id,
        ]);
        await client.query(
            'DELETE FROM qb."Quote_Nickname" WHERE quote_id = $1',
            [quote_id]
        );
        await client.query(
            'DELETE FROM qb."Quote_Quotee" WHERE quote_id = $1',
            [quote_id]
        );
        await client.query('DELETE FROM qb."Quote" WHERE quote_id = $1', [
            quote_id,
        ]);
    } catch (e) {
        console.log(`Error deleting quote: ${e}`);
    }
};

export { createClient, createKnex, deleteQuote };
