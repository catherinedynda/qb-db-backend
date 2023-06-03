// this runs a full export on stuff in the data folder
// so like you build the lists and run the full export script
import buildMemberList from './buildMemberList.js';
import buildNicknameList from './buildNicknameList.js';
import exportScript from './exportScript.js';

await buildMemberList();
await buildNicknameList();
await exportScript();