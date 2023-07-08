// This file takes all the unassigned nicknames and assigns them to any available quotees

// NOTE: before running this try changing the nickname list thing to only do things if it's a man
// by which I mean do WHERE person_id NOT NULL? or basically that result

import { createClient } from "../db.js";
import { processText } from "../utils/regex.js";
import { fixPeopleText } from "../utils/person.js";
import ObjectsToCsv from "objects-to-csv";

// await buildNicknameList();
// let nicknames = fs.readFileSync("data/nicknames.txt", "utf-8").split("\n");
// let nicknamePersonIds = fs
//   .readFileSync("data/nickname_person_ids.txt", "utf-8")
//   .split("\n");
// so basically
// for every nickname that has an associated person
// find all quotes that use that nickname
// then make a Quote_Quotee association
const client = await createClient();
const quotes = await client.query(
    'SELECT quote_id, quote_text FROM qb."Quote"'
);
const nickname_records = await client.query(
    'SELECT * FROM qb."Nickname" WHERE person_id IS NOT NULL'
);
console.log(nickname_records.rows);
console.log(nickname_records.rows[0]);
console.log(nickname_records.rows[0].nickname);
console.log(nickname_records.rows[0]["nickname"]);
let nicknameIds = [];
let nicknames = [];
let nicknamePersonIds = [];
// DO NOT mess with this code it makes it actually do things
// possibly console log can be taken out? VERY UNSURE
for (let i = 0; i < nickname_records.rows.length; i++) {
    let record = nickname_records.rows[i];
    //   console.log(record);
    nicknameIds.push(record.nickname_id);
    nicknames.push(record.nickname);
    nicknamePersonIds.push(record.person_id);
}
console.log(nicknameIds[5]);
console.log(nicknames);

// console.log(quotes.rows[0]);

for (let i = 0; i < quotes.rows.length; i++) {
    let quote = quotes.rows[i];
    //   console.log(quote.quote_text);
    //   console.log(quote.quote_id);
    if (quote.quote_text) {
        let people = processText(quote.quote_text);
        people = fixPeopleText(people);
        // console.log(people);
        for (let j = 0; j < people.length; j++) {
            if (nicknames.indexOf(people[j]) !== -1) {
                // it's at the same index
                // console.log("nickname found!");
                let person_id = nicknamePersonIds[nicknames.indexOf(people[j])];
                try {
                    await client.query(
                        'INSERT INTO qb."Quote_Quotee" (quote_id, person_id) VALUES ($1, $2)',
                        [quote.quote_id, person_id]
                    );
                } catch (e) {
                    console.log(`Error making quote/quotee connection: ${e}`);
                }
            }
        }
    }
}

let string =
    "“Mama, I love hearing you sing, but this song is quite hedonistic.”—a local 12 year old on her mother singing “man, I feel like a woman”";
console.log(processText(string));
client.end();
// for (let quote in quotes.rows) {
//   let people = processText(quote.quote_text);
//   people = fixPeople(people);
//   for (person in people) {
//     if (nicknames.indexOf(person) !== -1) {
//     }
//   }
// }
