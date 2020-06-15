require('dotenv').config()
const axios = require('axios');
const moment = require('moment');

const key = process.env.VUE_APP_API_KEY || '';

exports.run = async () => {

    let dataArray = []

    let opynHistory = (await axios.get(`https://public.defipulse.com/api/GetHistory?period=all&project=opyn&api-key=${key}`)).data;

    opynHistory.forEach(history => {
        data = history;

        console.log("Date: ", moment.unix(data.timestamp).format("YYYY-MM-DD"));
        console.log("TVL in USD: ", data.tvlUSD);
        console.log("TVL in ETH: ", data.tvlETH);
        console.log("ETH locked: ", data.ETH);
        console.log("DAI locked: ", data.DAI);

        dataArray.push({
            "date": moment.unix(data.timestamp).format("YYYY-MM-DD"),
            values: {
                "tvlUSD": data.tvlUSD,
                "tvlETH": data.tvlETH,
                "lockedETH": data.ETH,
                "lockedDAI": data.DAI,
            }
        })

    });

    return dataArray



}