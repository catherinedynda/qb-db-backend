import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
import { createKnex } from "../db.js";

router.get("/", urlencodedParser, async function (req, res) {
    // TODO: list of things to select that gets added to with each query piece?
    const knex = await createKnex();
    console.log(req.query);
    let query = knex
        .withSchema("qb")
        .from("Quote")
        .innerJoin("Member", "Quote.member_id", "=", "Member.member_id");
    let selectList = [
        "Quote.quote_id",
        "member_name",
        "quote_text",
        "time",
        "avatar_image",
    ];
    if (req.query.keyword) {
        const keyword = decodeURIComponent(req.query.keyword);
        if (req.query.case && req.query.case === "on") {
            query = query.whereLike("quote_text", `%${req.query.keyword}`);
        } else {
            query = query.whereILike("quote_text", `%${req.query.keyword}%`);
        }
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
    if (req.query.fromDate) {
        query = query.where("Quote.time", ">=", req.query.fromDate);
    }
    if (req.query.toDate) {
        query = query.where("Quote.time", "<=", req.query.toDate);
    }
    if ((req.query.limit && req.query.limit === "on")) {
        query = query.limit(30);
        console.log("query being limited");
    }
    // so if it's likes it should be the last thing??
    // no you can write big queries lmao
    if (req.query.sortby) {
        let direction = null;
        if (!req.query.direction) direction = "desc";
        else direction = req.query.direction;
        if (req.query.sortby === "date")
            query = query.orderBy("time", direction);
        else if (req.query.sortby === "likes") {
            query = query
                .innerJoin("Like", "Like.quote_id", "=", "Quote.quote_id")
                .count("Quote.quote_id")
                .groupBy("Quote.quote_id", "Member.avatar_image")
                .orderBy("count", direction);
        }
        // this may need to be done last? may need to adjust how query is finally called cause we may need to select specific things (esp for count and suchlike)
        // raw sql is up in datagrip, try test queries as well
        // else if (req.query.sortby === "likes") {
        //     // const likes = await [stuff to do for query to get likes for messages]
        //     // and then count them
        //     // and then
        // }
    }
    const quotes = await query.select(selectList);
    await knex.destroy();
    res.send(quotes);
});

export default router;
