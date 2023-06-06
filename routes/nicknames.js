import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
import { createClient, deleteQuote } from "../db.js";

async function updateDB(data, client) {
  console.log(data);
  console.log("updating DB");
  if (data["delete-quote"]) {
    // use an imported delete function, there's probably several things to follow up on
    console.log("delete quote");
    console.log(`quote_id: ${data.quote_id}`);
    await deleteQuote(data.quote_id, client);
  }

  // now we fix the person id
  let person_id = -1;
  if (parseInt(data.person_id) > 0) {
    console.log("there is an existing person id");
    person_id = parseInt(data.person_id);
  } else if (parseInt(data.person_id) === -1) {
    console.log("new person being added");
    try {
      await client.query('INSERT INTO qb."Quotee" (name) VALUES ($1)', [
        data.quotee_name,
      ]);
      let person = await client.query(
        'SELECT person_id FROM qb."Quotee" WHERE name = $1',
        [data.quotee_name]
      );
      person_id = person.rows[0].person_id;
    } catch (e) {
      console.log(`Error inserting new quotee and getting their id: ${e}`);
    }
  }

  if (data["add-verbatim"]) {
    console.log("adding person verbatim");
    try {
      await client.query('INSERT INTO qb."Quotee" (name) VALUES ($1)', [
        data.nickname,
      ]);
      let person = await client.query(
        'SELECT person_id FROM qb."Quotee" WHERE name = $1',
        [data.nickname]
      );
      person_id = person.rows[0].person_id;
    } catch (e) {
      console.log(`Error inserting new quotee and getting their id: ${e}`);
    }
  }

  // now we update the nickname association
  if (data["no-associate"]) console.log("no-associate on");
  else {
    try {
      await client.query(
        'UPDATE qb."Nickname" SET person_id = $1 WHERE nickname_id = $2',
        [person_id, data.nickname_id]
      );
    } catch (e) {
      console.log(`Error updating person associated with nickname: ${e}`);
    }
  }

  // now we update the quote and quotee association
  try {
    await client.query(
      'INSERT INTO qb."Quote_Quotee" (quote_id, person_id) VALUES ($1, $2)',
      [data.quote_id, person_id]
    );
  } catch (e) {
    console.log(`Error updating Quote_Quotee table: ${e}`);
  }
}

let names = ["Daniel", "Catherine", "Katrina", "Katie", "Caroline"];
router.get("/", async function (req, res, next) {
  const client = await createClient();
  // put error handling in here lmao
  let fields = await client.query('SELECT * FROM qb."nickname_setup" LIMIT 1');
  fields = fields.rows;
  console.log(fields);
  names = await client.query('SELECT person_id, name FROM qb."Quotee"');
  names = names.rows;
  client.end();
  res.render("nicknames", {
    title: "Nicknames",
    fields: fields,
    names: names,
  });
});

router.post("/", urlencodedParser, async function (req, res) {
  const client = await createClient();
  await updateDB(req.body, client);
  let fields = await client.query('SELECT * FROM qb."nickname_setup" LIMIT 1');
  fields = fields.rows;
  names = await client.query('SELECT person_id, name FROM qb."Quotee"');
  names = names.rows;
  client.end();
  res.render("nicknames", {
    title: "Nicknames",
    fields: fields,
    names: names,
  });
});

export default router;
