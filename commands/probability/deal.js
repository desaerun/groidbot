//imports
const {getRandomArrayMember} = require("../../tools/utils");
const {sendMessage} = require("../../tools/sendMessage");

//module settings
const name = "deal";
const description = "Deals a hand of cards";
const params = [
    {
        param: "size",
        type: "Integer",
        description: "How many cards to deal.",
        default: 1,
    },
];
const allowedContexts = [
    "text",
    "dm",
];
const adminOnly = false;

//main
const execute = async function (message, args) {
    args[0] = Math.abs(args[0]);
    if (args[0] === 0) {
        await sendMessage("Cannot deal 0 cards.", message.channel);
    }

    //build a deck
    const suits = [
        "Hearts",
        "Spades",
        "Diamonds",
        "Clubs",
    ];
    const ranks = [
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Jack",
        "Queen",
        "King",
        "Ace",
    ]
    let cards = [];
    let i = 0;
    for (let suit = 0; suit < suits.length; suit++) {
        for (let rank = 0; rank < ranks.length; rank++, i++) {
            cards.push(`${ranks[rank]} of ${suits[suit]}`);
        }
    }
    const deckSize = suits.length * ranks.length;

    // if a number bigger than the deck size is given, set it to the maximum size;
    args[0] = (args[0] > deckSize) ? deckSize : args[0];

    let hand = [];
    for (i = 1; i <= +args[0]; i++) {
        const cardIndex = Math.floor((Math.random() * cards.length));

        const card = getRandomArrayMember(cards);
        cards.splice(cardIndex, 1);
        hand.push(card);
    }
    try {
        await sendMessage(`Dealt the following cards (${hand.length}): **${hand.join("**, **")}**`, message.channel);
    } catch (e) {
        throw e;
    }
}

//module export
module.exports = {
    name: name,
    description: description,
    params: params,
    execute: execute,
    allowedContexts: allowedContexts,
    adminOnly: adminOnly,
}

//helper functions