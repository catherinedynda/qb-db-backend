import fs from "fs";
import ObjectsToCsv from "objects-to-csv";

fs.readFile("data/conversation_new.json", async (err, data) => {
  if (err) {
    console.log(err);
  }
  const conversationData = JSON.parse(data);
  //   console.log(conversationData["members"]);
  let members = [];
  for (let member of conversationData["members"]) {
    // console.log(member);
    members.push({
      member_id: member["user_id"],
      display_name: member["nickname"],
      groupme_name: member["name"],
      avatar_image: member["image_url"],
    });
  }
  console.log(members);
  const csv = new ObjectsToCsv(members);
  await csv.toDisk("data/members.csv");
});
