import fs from 'fs';
import { createClient } from './db.js';

const fixPeople = (msg) => {
        if (msg.people) {
            let newPeople = [];
            let memberNames = fs.readFileSync('data/member_names.txt', 'utf-8');
            memberNames = memberNames.split('\n');
            let memberIds = fs.readFileSync('data/member_ids.txt', 'utf-8');
            memberIds = memberIds.split('\n');
            msg.people.forEach(async (person) => {
                if (person.search(/^Me/) !== -1) {
                    person = memberNames[memberIds.indexOf(msg.quote.member_id)];
                } else if (person.search(/^My/i) !== -1) {
                    const member = memberNames[memberIds.indexOf(msg.quote.member_id)];
                    person = person.replace(/^My/i, `${member}'s`);
                }
                newPeople.push(person);
            })
            return newPeople;
            // console.log(msg.people);
            // console.log(newPeople);
            // console.log('\n');
        } else {
            return [];
        }
}

const processPerson = async (msg) => {
    // if (msg.people) {
        // if (msg.people[0].search(/^Me/)) {
        if (msg.search(/^Me/)) {
            try {
                const client = await createClient();
                const member = await client.query('SELECT groupme_name FROM qb."Member" WHERE member_id = $1', [74325816]);
                console.log(member.rows[0].groupme_name);
                client.end();
            } catch (e) {
                console.log(`Error requesting member: ${e}`);
            }
        }
    // }
    return [];
    // try {
    //     const res = await client.query('SELECT * FROM qb."Member"');
    //     console.log(res.rows[0]);
    //     client.end();
    // } catch (e) {
    //     console.log(`Error: ${e}`);
    // }
}

// processPerson('heemo');

export { processPerson, fixPeople };