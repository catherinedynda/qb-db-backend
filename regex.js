/** REGEX **/
const personFirstReg = /^.+:{1}\s+.+/;
const personFirstAction = /^\*.+\*\n+.+:{1}\s+.+/;
const personFirstExtraSpace = /^[\S\s]+.+:{1}[^\S\r\n]+.+/;
const personFirstHyphen = /^.+-{1} {1}.+/;

const quoteFirstReg = /^[\S\s]+\s+[-–—~]{1}[\S\s]+$/;
const quoteFirstTessa = /^[\S\s]+[”\"]{1}[—–-]{1}.+$/;
const quoteFirstNonHyphen = /^[“\"]{1}.+[”\"]{1}\n.+$/
/** END REGEX **/

// things to split person on--these are not things that should be included in a person
const personSplit = /,|\(| to |\n/;

const funcTest = () => {
    console.log("function running");
}

const processMessage = (msg) => {
    // console.log(msg['text']);
    let text = msg.text;
    if (text == null) {
        return;
    }
    text = text.trim();

    let textPeople = [];
    let patternMatched = "";

    if (text.search(quoteFirstReg) !== -1) {
        // console.log(text);
        let quoteInfo = processQuoteFirstPeople(text);
        if (quoteInfo.length > 1) {
            textPeople = quoteInfo[0];
            // if second item in array is true, it's actually person-first
            if (quoteInfo[1]) {
                patternMatched = "personFirstReg";
            }
            else patternMatched = "quoteFirstReg";
        }
        // console.log(textPeople);
    } else if (text.search(quoteFirstTessa) !== -1) {
        patternMatched = "quoteFirstTessa";
        textPeople = processQFTessaPeople(text);
        // regular quote first probably doesn't work bc of the whitespace split requirement thing
    } else if (text.search(personFirstReg) !== -1) {
        if (text.search("Created new poll") === -1) {
            patternMatched = "personFirstReg";
            textPeople = processPersonFirstPeople(text);
        }
    } else if (text.search(personFirstAction) !== -1) {
        patternMatched = "personFirstAction";
        textPeople = processPersonFirstPeople(text);
    } else if (text.search(personFirstExtraSpace) !== -1) {
        patternMatched = "personFirstExtraSpace";
        textPeople = processPersonFirstPeople(text);
    } else if (text.search(personFirstHyphen) !== -1) {
        patternMatched = "personFirstHyphen";
        textPeople = processPFHyphen(text);
    } else if (text.search(quoteFirstNonHyphen) !== -1) {
        patternMatched = "quoteFirstNonHyphen";
        textPeople = processQFNonHyphen(text);
    } else {
        // not a quote
        return null;
    }

    let likes = [];
    msg.favorited_by.forEach((like) => likes.push(like))

    textPeople = splitAnd(textPeople);

    const quote = {
        "quote_id": msg['id'],
        "member_id": msg['sender_id'],
        "quote_text": msg['text'],
        "member_name": msg['name'],
        "time": msg['created_at'],
    };
    const people = textPeople;
    return {
        "quote": quote,
        "people": people,
        "likes": likes,
        "pattern": patternMatched,
    };
}

const splitAnd = (people) => {
    let newPeople = [];
    people.forEach((person) => {
        if (person.search(' and ') !== -1) {
            person.split(' and ').forEach(newPerson => newPeople.push(newPerson));
        } else {
            newPeople.push(person);
        }
    })
    return newPeople;
}

const processPFHyphen = (text) => {
    let textLines = text.split(/\n/);
    let people = [];
    let personTooLong = true;
    textLines.forEach((line) => {
        let textPeople = line.split(/-{1} {1}/);
        if (textPeople.length > 1) {
            let person = textPeople[0].split(/,|\(/)[0].trim();
            if (personTooLong && person.split(' ').length < textPeople[1].split(' ').length) {
                personTooLong = false;
            }
            people.push(textPeople[0].split(personSplit)[0].trim());
        }
    });
    if (personTooLong) {
        return processQFNoSpace(text);
    }
    return people;
}

const processPersonFirstPeople = (text) => {
    let textLines = text.split(/\n/);
    let personTooLong = true;
    let people = [];
    textLines.forEach((line) => {
        let textColons = line.split(':');
        let textColons2 = textColons[0].split(/,|\(/);
        let textPeople = line.split(/:|,|\(| to /);
        if (textPeople.length > 1) {
            if (textColons.length > 1) {
                people.push(textColons2[0].trim());
            }
            if ((personTooLong) && (textColons.length > 1) && (textPeople[0].split(' ').length < textColons[1].split(' ').length)) {
                personTooLong = false;
            }
        }
    })

    if (!personTooLong) {
        return people;
    } else {
        return [];
    }
}

// returns [listOfPeople, isPersonFirst]
const processQuoteFirstPeople = (text) => {
    // do a couple checks to see if it's actually person-first
    // TODO: possibly extract this into a separate function?
    let textLines = text.split(/\n+/);
    let personFirst = true;
    textLines.forEach((line) => {
        if (line.search(personFirstReg) == -1) {
            personFirst = false;
        }
    });
    if (personFirst) {
        return [processPersonFirstPeople(text), true];
    }

    personFirst = true;
    textLines.forEach((line) => {
        if (line.search(/^.+-{1} {1}[\"“]{1}[\S\s]+[\"”]{1}$/) == -1) {
            personFirst = false;
        }
    });
    if (personFirst) return [processPersonFirstPeople(text), true];

    // actual quote-first processing
    let textHyphens = text.split(/\s+-|\s+–|\s+—|\s+~/);
    let person = textHyphens[textHyphens.length - 1].trim().split(personSplit)[0].trim()
    // the person is too long
    if (textHyphens[0].split(' ').length < person.split(' ').length) {
        if (text.search(/^[\S\s][^\n]+[-–—]{1}\s+[^\n]/) !== -1) {
            return [processPFHyphen(text), true];
        }
    }

    return [[person], false];
}

const processQFNoSpace = (text) => {
    let textHyphens = text.split(/-/);
    let person = textHyphens[textHyphens.length - 1];
    person = person.split(personSplit)[0].trim();
    return [person];
}

const processQFTessaPeople = (text) => {
    let textHyphens = text.split(/[”\"]{1}[—–-]{1}/);
    let person = textHyphens[textHyphens.length - 1];
    person = person.split(personSplit)[0].trim();
    return [person];
}

const processQFNonHyphen = (text) => {
    let textLines = text.split(/[”\"]{1}\n/);
    let person = "";
    if (textLines[textLines.length - 1].search(/[”\"]{1}$/) === -1) {
        person = textLines[textLines.length - 1].split(personSplit)[0].trim();
    }
    return [person];
}

export { processMessage, funcTest }