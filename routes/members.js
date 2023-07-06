import express from "express";
const router = express.Router();
import { createClient } from "../db.js";

router.get("/", async function (req, res) {
    const client = await createClient();
    const members = await client.query(
        'SELECT name, member_id FROM qb."Member"'
    );
    await client.end();
    res.send(members.rows);
});

export default router;
