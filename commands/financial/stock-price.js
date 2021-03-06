//imports
const axios = require("axios");
const {formatMoney} = require("../../tools/utils");
const {sendMessage} = require("../../tools/sendMessage");

//module settings
const name = "stock-price";
const description = "Retrieves stock prices from Finnhub API (in USD)";
const params = [
    {
        param: "stockTicker",
        type: "String",
        description: "a stock ticker (GME, MOON)",
        default: "GME",
    }
];
const allowedContexts = [
    "text",
    "dm",
];
const adminOnly = false;

//main
const execute = async function (message, args) {
    if (args.length > 1) {
        await sendMessage(`You cannot make multiple requests at once. (Requested ${args})`, message.channel);
        return;
    }

    let ticker = args[0].toUpperCase();
    try {
        const tickerData = await getTickerData(ticker);
        let priceDiff = tickerData.c - tickerData.pc;
        let percDiff = priceDiff / tickerData.pc;

        let curPriceFormatted = formatMoney(tickerData.c);
        let priceDiffFormatted = (priceDiff < 0 ? "" : "+") + formatMoney(priceDiff);
        let percDiffFormatted = (priceDiff < 0 ? "" : "+") + percentFormat.format(percDiff);
        await sendMessage(`${ticker} = **${curPriceFormatted}** (**${priceDiffFormatted}**[**${percDiffFormatted}**] today)`, message.channel);
    } catch (err) {
        await sendMessage(`error fetching stock price: ${err}`, message.channel);
    }
}

//helper functions
const getTickerData = async function (ticker) {
    const token = "c13ockf48v6qin45qo40";
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${token}`);
        if (response.status === 200) {
            return response.data;
        } else {
            await sendMessage(`error fetching stock price: ${err}`, message.channel);
        }
    } catch (err) {
        throw err;
    }
}

const percentFormat = new Intl.NumberFormat("en-US",
    {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

//module export
module.exports = {
    name: name,
    description: description,
    params: params,
    execute: execute,
    allowedContexts: allowedContexts,
    adminOnly: adminOnly,
    getTickerData: getTickerData,
}