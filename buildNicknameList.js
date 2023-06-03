import { createClient } from './db.js';
import fs from 'fs';

async function buildNicknameList() {
    const client = await createClient();
    const members = await client.query('SELECT * from qb."Nickname"');
    console.log(members.rows[0]);

    // NOTE: only works if this is run when you are in its directory, not when in a directory above
    // when you do that it wants to treat these pathnames as...relative to the directory you're running
    // it from
    // so...not great
    const writeStreamNames = fs.createWriteStream('data/nicknames.txt');
    const writeStreamIds = fs.createWriteStream('data/nickname_ids.txt');
    members.rows.forEach((row) => {
        writeStreamNames.write(`${row.nickname}\n`);
        writeStreamIds.write(`${row.nickname_id}\n`);
    })
    // the finish event is emitted when all data has been flushed from the stream
    writeStreamNames.on('finish', () => {
    console.log(`wrote all the array data to file`);
    // client.end();
    });
    writeStreamIds.on('finish', () => {
        console.log('wrote array data to file');
    })

    // handle the errors on the write process
    writeStreamNames.on('error', (err) => {
        console.error(`There is an error writing the file => ${err}`)
    });
    writeStreamIds.on('error', (err) => {
        console.error(`There is an error writing the file => ${err}`)
    });

    // close the stream
    writeStreamNames.end();
    writeStreamIds.end();

    client.end();
}

buildNicknameList();

export default buildNicknameList;