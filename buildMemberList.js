import { createClient } from "./db.js";
import fs from "fs";

async function buildMemberList() {
  console.log("building member list...");
  const client = await createClient();
  const members = await client.query('SELECT * from qb."Member"');
  // console.log(members.rows[0]);

  // NOTE: only works if this is run when you are in its directory, not when in a directory above
  // when you do that it wants to treat these pathnames as...relative to the directory you're running
  // it from
  // so...not great
  const writeStreamNames = fs.createWriteStream("data/member_names.txt");
  const writeStreamIds = fs.createWriteStream("data/member_ids.txt");
  members.rows.forEach((row) => {
    writeStreamNames.write(`${row.name}\n`);
    writeStreamIds.write(`${row.member_id}\n`);
  });
  // the finish event is emitted when all data has been flushed from the stream
  writeStreamNames.on("finish", () => {
    console.log(`wrote all the array data to file`);
    // client.end();
  });
  writeStreamIds.on("finish", () => {
    console.log("wrote array data to file");
  });

  // handle the errors on the write process
  writeStreamNames.on("error", (err) => {
    console.error(`There is an error writing the file => ${err}`);
  });
  writeStreamIds.on("error", (err) => {
    console.error(`There is an error writing the file => ${err}`);
  });

  // close the stream
  writeStreamNames.end();
  writeStreamIds.end();

  client.end();
}

buildMemberList();

export default buildMemberList;
