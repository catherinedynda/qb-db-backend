import dotenv from "dotenv";
import fs from "fs";
import { processMessage } from "../utils/regex.js";
import { processPerson, fixPeople } from "../utils/person.js";
import pkg from "pg";
import ObjectsToCsv from "objects-to-csv";
dotenv.config();
const { Client } = pkg;

// this works if you have a data/message.json that holds all the messages from the GM export
fs.readFile("data/message.json", async (err, data) => {
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
        console.log(nicknames);
        let nicknameIds = fs
            .readFileSync("data/nickname_ids.txt", "utf-8")
            .split("\n");
        const writeStream = fs.createWriteStream("data/nicknames.csv");
        const writeStream2 = fs.createWriteStream("data/quote_nickname.csv");
        const writeStreamLikes = fs.createWriteStream("data/likes.csv");
        writeStream.write("person_id,nickname\n");
        writeStream2.write("quote_id,nickname_id\n");
        writeStreamLikes.write("quote_id,member_id\n");
        // personFirstReg.forEach(value => writeStream.write(`{ ${value.person} }\n`));
        // the finish event is emitted when all data has been flushed from the stream
        writeStream.on("finish", () => {
            console.log(`wrote all the array data to file`);
            // client.end();
        });
        writeStreamLikes.on("finish", () => console.log("likes written"));
        writeStreamLikes.on("error", (err) => console.log(err));

        // handle the errors on the write process
        writeStream.on("error", (err) => {
            console.error(`There is an error writing the file => ${err}`);
        });
        for (let i = 0; i < messageData.length; i++) {
            let processedMsg = processMessage(messageData[i]);
            if (processedMsg) {
                let none = false;
                processedMsg.likes.forEach((like) => {
                    writeStreamLikes.write(
                        `${processedMsg.quote.quote_id},${like}\n`
                    );
                });
                // if (processedMsg.person) {
                // console.log(processedMsg.person);
                // processedMsg.person = processPerson(client, processedMsg
                const fixedPeople = fixPeople(processedMsg);
                processedMsg.person = fixedPeople;
                fixedPeople.forEach((person) => {
                    // writeStream.write(`DEFAULT,null,${person}\n`);
                    if (nicknames.indexOf(person) !== -1) {
                        // console.log(`${person} worked`);
                        let nicknameId = nicknameIds[nicknames.indexOf(person)];
                        writeStream2.write(
                            `${processedMsg.quote.quote_id},${nicknameId}\n`
                        );
                    } else {
                        console.log(`ERROR nickname ${person} not found!`);
                    }

                    if (!people.includes(person)) {
                        writeStream.write(`,${person}\n`);
                        people.push(person);
                    }
                });
                // processedMsg.person.forEach(async (person) => {
                //     // try {
                //     //     const res = await client.query('SELECT * FROM qb."Member"');
                //     //     console.log(res.rows[0]);
                //     // } catch (e) {
                //     //     console.log(e);
                //     // }
                //     try {
                //         const person2 = await processPerson(client, person);
                //     } catch (e) {
                //         console.log(e);
                //     }
                //     if (!people.includes(person)) {
                //         people.push(person);
                //     }
                // });
                // }
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
                            // console.log(`{ ${processedMsg.quote.quote_text} }`);
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
            // fs.create
            // if (processedMsg) {
            //     fs.write(fd, `{ ${processedMsg.quote.quote_text} }\n`, () => console.log("heemo"));
            // }
        } // end for all data
        console.log(quotes.length);
        const csv = new ObjectsToCsv(quotes);
        await csv.toDisk("data/quotes.csv");
        console.log(`personFirstCounter: ${personFirstCounter}`);
        console.log(`quoteFirstCounter: ${quoteFirstCounter}`);
        console.log(`noneCounter: ${noneCounter}`);
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
        // quotesToCompare = JSON.stringify(quotesToCompare);
        // const writeStream = fs.createWriteStream('data/nicknames.csv');
        // people = people.sort();
        // people.forEach(value => writeStream.write(`${value}\n`));
        // // personFirstReg.forEach(value => writeStream.write(`{ ${value.person} }\n`));
        // // the finish event is emitted when all data has been flushed from the stream
        // writeStream.on('finish', () => {
        // console.log(`wrote all the array data to file`);
        // // client.end();
        // });

        // // handle the errors on the write process
        // writeStream.on('error', (err) => {
        //     console.error(`There is an error writing the file => ${err}`)
        // });

        // // close the stream
        // writeStream.end();
        writeStream.end();
        writeStreamLikes.end();
        // fs.open('data/quoteFirstReg.txt', 'w', (err, fd) => {
        //     if (err) console.log(err);
        //     else {
        //         fs.write(fd, quotesToCompare, () => {});
        //     }
        // })
        // console.log(quoteFirstReg);
        // quoteLists.forEach((quoteList) => {
        //     // console.log(quoteList);
        //     if (quoteList.length > 1) {
        //         fs.open('data/quoteFirstReg.txt', 'w', (err, fd) => {
        //         // fs.open(`data/${quoteList[0].pattern}.txt`, (err, fd) => {
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 quoteList.forEach((quote) => {
        //                     // console.log(quote);
        //                     fs.write(fd, `{ ${quote.quote.quote_text} }\n`, () => {});
        //                 });
        //                 // fs.write(fd, '{ ', () => {});
        //                 // quoteList.forEach((quote) => {
        //                 //     // console.log(quote);
        //                 //     for (const person in quote.person) {
        //                 //         fs.write(fd, `${person}, `, () => {});
        //                 //     }
        //                 // });
        //                 // fs.write(fd, '}\n', () => {});
        //             }
        //         })
        //     }
        // });
        // fs.write(fd, "{ ", () => {});
        // people.forEach((person) => {
        //     fs.write(fd, `${person}, `, () => {});
        //     // console.log(person);
        // });
        // fs.write(fd, "}\n", () => {});

        // for (let i = 0; i < 1000; i++) {
        //     processMessage(messageData[i]);
        // }
    }
});

// client.end();
