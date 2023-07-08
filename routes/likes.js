import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
import { createClient } from "../db.js";

router.get("/", async function (req, res) {
    console.log(req.query);
    const client = await createClient();
    // res.set("Access-Control-Allow-Origin", "*");
    if (req.query.quote_id) {
        const likes = await client.query(
            'SELECT * FROM qb."Like" INNER JOIN qb."Member" ON "Like".member_id = "Member".member_id WHERE quote_id = $1',
            [req.query.quote_id]
        );
        res.send(likes.rows);
    } else {
        res.send(["error"]);
    }
});

export default router;
