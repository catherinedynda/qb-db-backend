import dotenv from "dotenv";
import fs from "fs";
import { processMessage } from "../utils/regex.js";
import { fixPeople } from "../utils/person.js";
// import pkg from 'pg';
import ObjectsToCsv from "objects-to-csv";
dotenv.config();

// this works if you have a data/message.json that holds all the messages from the GM export
export default async function () {
    fs.readFile("data/message_new.json", async (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let messageData = JSON.parse(data);
            let people = [];
            let quotes = [];
            // let personFirstReg, personFirstAction, personFirstExtraSpace, personFirstHyphen = [];
            let personFirstReg = [];
            let personFirstAction = [];
            let personFirstExtraSpace = [];
            let personFirstHyphen = [];
            let quoteFirstReg = [];
            let quoteFirstTessa = [];
            let quoteFirstNonHyphen = [];
            let personFirstCounter = 0;
            let quoteFirstCounter = 0;
            let noneCounter = 0;
            // const writeStreamQuotes = fs.createWriteStream('data/quotes.csv');
            let nicknames = fs
                .readFileSync("data/nicknames.txt", "utf-8")
                .split("\n");
            let nicknameIds = fs
                .readFileSync("data/nickname_ids.txt", "utf-8")
                .split("\n");
            let nicknamesNew = [];

            // makes CSV files with the data needed for the Nickname, Quote_Nickname, and Likes tables
            const writeStreamNicknames =
                fs.createWriteStream("data/nicknames.csv");
            const writeStreamQuoteNickname = fs.createWriteStream(
                "data/quote_nickname.csv"
            );
            const writeStreamLikes = fs.createWriteStream("data/likes.csv");
            writeStreamNicknames.write("person_id,nickname\n");
            writeStreamQuoteNickname.write("quote_id,nickname_id\n");
            writeStreamLikes.write("quote_id,member_id\n");
            // personFirstReg.forEach(value => writeStream.write(`{ ${value.person} }\n`));
            // the finish event is emitted when all data has been flushed from the stream
            writeStreamNicknames.on("finish", () => {
                console.log(`Nicknames CSV written`);
            });
            writeStreamQuoteNickname.on("finish", () =>
                console.log("Quote_Nickname CSV written")
            );
            writeStreamLikes.on("finish", () =>
                console.log("Likes CSV written")
            );
            writeStreamNicknames.on("err", (err) =>
                console.log(`Error writing nicknames: ${err}`)
            );
            writeStreamQuoteNickname.on("err", (err) =>
                console.log(`Error writing quote_nickname: ${err}`)
            );
            writeStreamLikes.on("error", (err) =>
                console.log(`Error writing likes: ${err}`)
            );

            for (let i = 0; i < messageData.length; i++) {
                let processedMsg = processMessage(messageData[i]);
                if (processedMsg) {
                    let none = false;
                    processedMsg.likes.forEach((like) => {
                        writeStreamLikes.write(
                            `${processedMsg.quote.quote_id},${like}\n`
                        );
                    });
                    const fixedPeople = fixPeople(processedMsg);
                    processedMsg.people = fixedPeople;
                    fixedPeople.forEach((person) => {
                        // writeStream.write(`DEFAULT,null,${person}\n`);
                        if (nicknames.indexOf(person) !== -1) {
                            // console.log(`${person} worked`);
                            let nicknameId =
                                nicknameIds[nicknames.indexOf(person)];
                            writeStreamQuoteNickname.write(
                                `${processedMsg.quote.quote_id},${nicknameId}\n`
                            );
                        } else {
                            console.log(`ERROR nickname ${person} not found!`);
                            if (nicknamesNew.indexOf(person) !== -1) {
                                nicknamesNew.push(person);
                                writeStreamNicknames.write(`,${person}\n`);
                            }
                        }

                        // if (!people.includes(person)) {
                        //   writeStreamNicknames.write(`,${person}\n`);
                        //   people.push(person);
                        // }
                    });
                    if (processedMsg.pattern) {
                        switch (processedMsg.pattern) {
                            case "personFirstReg":
                                personFirstReg.push(processedMsg);
                                personFirstCounter++;
                                break;
                            case "personFirstAction":
                                personFirstAction.push(processedMsg);
                                personFirstCounter++;
                                break;
                            case "personFirstExtraSpace":
                                personFirstExtraSpace.push(processedMsg);
                                personFirstCounter++;
                                break;
                            case "personFirstHyphen":
                                personFirstHyphen.push(processedMsg);
                                personFirstCounter++;
                                break;
                            case "quoteFirstReg":
                                quoteFirstReg.push(processedMsg);
                                quoteFirstCounter++;
                                break;
                            case "quoteFirstTessa":
                                quoteFirstTessa.push(processedMsg);
                                quoteFirstCounter++;
                                break;
                            case "quoteFirstNonHyphen":
                                quoteFirstNonHyphen.push(processedMsg);
                                quoteFirstCounter++;
                                break;
                            default:
                                noneCounter++;
                                none = true;
                                break;
                        }
                    }
                    let date = new Date(processedMsg.quote.time * 1000);
                    // console.log(date);
                    processedMsg.quote.time = date.toISOString();
                    if (!none) {
                        quotes.push(processedMsg.quote);
                    }
                } else {
                    noneCounter++;
                }
            } // end for all data
            // console.log(quotes.length);
            const csv = new ObjectsToCsv(quotes);
            await csv.toDisk("data/quotes.csv");
            // console.log(`personFirstCounter: ${personFirstCounter}`);
            // console.log(`quoteFirstCounter: ${quoteFirstCounter}`);
            // console.log(`noneCounter: ${noneCounter}`);
            const quoteLists = [
                personFirstReg,
                personFirstAction,
                personFirstExtraSpace,
                personFirstHyphen,
                quoteFirstReg,
                quoteFirstTessa,
                quoteFirstNonHyphen,
            ];
            let quotesToCompare = [];
            quoteFirstReg.forEach((quote) => {
                let text = quote.quote.quote_text;
                quotesToCompare.push(`{ ${text} }\n`);
            });

            writeStreamNicknames.end();
            writeStreamQuoteNickname.end();
            writeStreamLikes.end();
        }
    });
}

// client.end();
