import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

const createClient = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PWD,
  });

  try {
    await client.connect();
  } catch (e) {
    console.log(`Error: ${e}`);
  }

  return client;
};

// safely deletes a quote and associated items
const deleteQuote = async (quote_id, client) => {
  try {
    await client.query('DELETE FROM qb."Like" WHERE quote_id = $1', [quote_id]);
    await client.query('DELETE FROM qb."Quote_Nickname" WHERE quote_id = $1', [
      quote_id,
    ]);
    await client.query('DELETE FROM qb."Quote_Quotee" WHERE quote_id = $1', [
      quote_id,
    ]);
    await client.query('DELETE FROM qb."Quote" WHERE quote_id = $1', [
      quote_id,
    ]);
  } catch (e) {
    console.log(`Error deleting quote: ${e}`);
  }
};

export { createClient, deleteQuote };
