import express from "express";
const router = express.Router();
import { createClient } from "../db.js";

router.get("/", async function (req, res) {
    const client = await createClient();
    const quotees = await client.query(
        'SELECT name, person_id FROM qb."Quotee"'
    );
    await client.end();
    res.send(quotees.rows);
});

export default router;
