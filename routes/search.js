import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
import { createKnex } from "../db.js";

router.get("/", urlencodedParser, async function (req, res) {
    // TODO: list of things to select that gets added to with each query piece?
    const knex = await createKnex();
    console.log(req.query);
    let query = knex.withSchema("qb").from("Quote");
    if (req.query.keyword) {
        query = query.whereILike("quote_text", `%${req.query.keyword}%`);
    }
    if (req.query.member) {
        query = query.where("Quote.member_id", req.query.member);
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
    query = query.innerJoin(
        "Member",
        "Quote.member_id",
        "=",
        "Member.member_id"
    );
    const quotes = await query.select().limit(30);
    await knex.destroy();
    // res.send(["heemo time"]);
    res.send(quotes);
});

export default router;
