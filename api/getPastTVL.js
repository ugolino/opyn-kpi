// require('dotenv').config()
const axios = require('axios');
const moment = require('moment');

const key = process.env.VUE_APP_API_KEY || '';

exports.run = async (startDate, endDate=null) => {

    let dataArray = []

    console.log(startDate)
    console.log(endDate)

    
    let startDateTimestamp;
    try {
        if (startDate == undefined) {
            console.log("Invalid date input");
            return
        }

        startDateTimestamp = moment.utc(startDate).valueOf() / 1000;
    }
    catch(e) {
        console.log("Invalid start date input");
    }

    let endDateTimestamp;
    if (endDate) {
        try {
            if (startDate == undefined) {
                console.log("Invalid date input");
                return
            }

            endDateTimestamp = moment.utc(endDate).valueOf() / 1000;
        }
        catch (e) {
            console.log("Invalid end date input");
        }
    }


        let opynHistory = (await axios.get(`https://public.defipulse.com/api/GetHistory?period=all&project=opyn&api-key=${key}`)).data;

        opynHistory.forEach(history => {

            

            if (endDateTimestamp ? (history.timestamp >= startDateTimestamp && history.timestamp <= endDateTimestamp) : history.timestamp === startDateTimestamp ) {
                
                let data = history;

                if (data) {
                    console.log("Date: ", moment.unix(data.timestamp).format("YYYY-MM-DD") );
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

                }

                else {
                    console.log("Data not found!");
                }

            }
        });

    return dataArray



}