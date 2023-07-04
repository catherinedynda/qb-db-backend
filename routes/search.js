import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
import { createClient, createKnex } from "../db.js";

router.get("/", urlencodedParser, async function (req, res) {
    const knex = await createKnex();
    console.log(req.query);
    let query = knex.withSchema("qb").from("Quote");
    if (req.query.keyword) {
        query = query.whereILike("quote_text", `%${req.query.keyword}%`);
    }
    if (req.query.member) {
        query = query.where("member_id", req.query.member);
    }
    if (req.query.quotee) {
        query = query
            .innerJoin(
                "Quote_Quotee",
                "Quote.quote_id",
                "=",
                "Quote_Quotee.quote_id"
            )
            .innerJoin(
                "Quotee",
                "Quote_Quotee.person_id",
                "=",
                "Quotee.person_id"
            )
            .where("Quotee.person_id", req.query.quotee);
    }
    const quotes = await query.select();
    await knex.destroy();
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    // res.send(["heemo time"]);
    res.send(quotes);
});

export default router;