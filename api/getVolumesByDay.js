// Import modules
const utils = require('./utils');
const registry = require('./registry');
const fetch = require("node-fetch");
const moment = require('moment');

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

const historicalPrices = []

exports.run = async (tokens) => {

    let uniswapFactoryInstance = await utils.initContract(utils.UniswapFactoryAbi, registry.uniswapFactory);  // uniswap factory

    const volumesArray = []

    const getData = async () => {

        return Promise.all(
            tokens.slice().map(async(token, i) => {


                let otokenName = await token.methods.name().call(); // oToken name
                let otokenDecimals = await token.methods.decimals().call();    // oToken decimals
                let otokenUnderlyingAdd = await token.methods.underlying().call();    // oToken underlying token address
                let otokenStrikeAdd = await token.methods.strike().call();    // oToken strike token address
                let otokenStrikePrice = await token.methods.strikePrice().call();  // oToken strike price

                let tokensSold = []
                let tokensBought = []

                // ignore oToken without name
                if (utils.toHex(otokenName) == 0x0) {
                    return;
                }

                let tokenUniswapExchangeAdd = await uniswapFactoryInstance.methods.getExchange(token._address).call(); // oToken uniswap exchange address
                let uniswapExchange = await utils.initContract(utils.UniswapExchangeAbi, tokenUniswapExchangeAdd);  // uniswap exchange for the otoken

                if (otokenUnderlyingAdd == ADDRESS_ZERO ||
                    registry.tokens.includes(otokenUnderlyingAdd.toLowerCase()) ||
                    (otokenStrikeAdd == ADDRESS_ZERO) && (otokenUnderlyingAdd == registry.usdcAddress)
                ) {
                    let id = i + 1
                    console.log(otokenName, id)

                    let soldEvents = await uniswapExchange.getPastEvents('EthPurchase', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });

                    for (let i = 0; i < soldEvents.length; i++) {
                        let timestamp = await utils.getDateFromBlock(soldEvents[i].blockNumber)

                        // let date = new Date(timestamp * 1000).toDateString()

                        var date = moment.unix(timestamp).format("MM/DD/YY");


                        tokensSold.push({ date: date, tokensAmount: soldEvents[i].returnValues.tokens_sold })
                    }

                    let boughtEvents = await uniswapExchange.getPastEvents('TokenPurchase', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });

                    for (let i = 0; i < boughtEvents.length; i++) {
                        let timestamp = await utils.getDateFromBlock(boughtEvents[i].blockNumber)

                        // let date = new Date(timestamp * 1000).toDateString()

                        var date = moment.unix(timestamp).format("MM/DD/YY");

                        tokensBought.push({ date: date, tokensAmount: boughtEvents[i].returnValues.tokens_bought })
                    }

                    // console.log("tokensSold :", tokensSold, "tokensBought :", tokensBought)

                    groupSoldByDate = groupAndSum(tokensSold, otokenDecimals).sort((a, b) => new Date(a.date) - new Date(b.date))


                    let totalSoldByDate = await Promise.all(groupSoldByDate.map(async function (el) {
                        // check if call
                        
                        let isCall = ((otokenStrikeAdd.toLowerCase() == ADDRESS_ZERO) && (otokenUnderlyingAdd == registry.usdcAddress)) ? 
                            true : 
                            false
                        // if call use multiplier
                        let callMultiplier = isCall ? (1 / otokenStrikePrice.value * (otokenStrikePrice.exponent === "-11" ? 100000 : 1000)) : false
                        // if call token is eth
                        let token = isCall ? ADDRESS_ZERO : otokenUnderlyingAdd.toLowerCase()

                        let assetPrice = await getTokenPrice(token, el.date)

                        let total = callMultiplier ? ((assetPrice * el.tokensAmount) / callMultiplier) : (assetPrice * el.tokensAmount)

                        let o = Object.assign({}, el);
                        o.assetPrice = assetPrice
                        o.total = total
                        return o;
                    }))

                    totCummulativeSold = 0
                    totalSoldByDate.forEach(el =>
                        el.cumulative = totCummulativeSold += el.total
                    )

                    console.log(otokenName, 'totalSoldByDate', totalSoldByDate)


                    groupBoughtByDate = groupAndSum(tokensBought, otokenDecimals).sort((a, b) => new Date(a.date) - new Date(b.date))


                    let totalBoughtByDate = await Promise.all(groupBoughtByDate.map(async function (el) {

                        let callMultiplier = false
                        let token = otokenUnderlyingAdd

                        if ((otokenStrikeAdd === ADDRESS_ZERO) && (otokenUnderlyingAdd === registry.usdcAddress)) {
                            callMultiplier = (1 / otokenStrikePrice.value * (otokenStrikePrice.exponent === "-11" ? 100000 : 1000));
                            token = ADDRESS_ZERO
                        }

                        let assetPrice = await getTokenPrice(token, el.date)

                        let total = callMultiplier ? ((assetPrice * el.tokensAmount) / callMultiplier) : (assetPrice * el.tokensAmount)

                        let o = Object.assign({}, el);
                        o.assetPrice = assetPrice
                        o.total = total
                        return o;
                    }))

                    totCummulativeBought = 0
                    totalBoughtByDate.forEach(el =>
                        el.cumulative = totCummulativeBought += el.total
                    )

                    console.log(otokenName, 'totalBoughtByDate', totalBoughtByDate)

                    volumesArray.push({ name: otokenName, id: id, totalSoldByDate: totalSoldByDate, totalBoughtByDate: totalBoughtByDate })

                }

            })
        )
        
    }

    res = await getData().then( () => {
        return volumesArray
    })

    return res

    

}

getTokenPrice = async (address, date) => {
    let formattedAddress = address.toLowerCase()
    let tokenAddress = address === registry.wethAddress ? ADDRESS_ZERO : formattedAddress
    prices = await checkHistoricalPrices(formattedAddress)
   
    let pricesByAddress = prices.filter(addr => addr.address === formattedAddress)[0].prices


    price = Object.keys(pricesByAddress)
        .filter(key => 
            moment(date).format("DD-MM-YYYY") === moment(key).format("DD-MM-YYYY")
    ).reduce((obj, key) => {
        obj[key] = pricesByAddress[key];
        return obj;
    }, {})

    return Object.values(price)[0]
    
}

checkHistoricalPrices = async (address) => {
    if (historicalPrices.filter(addr => addr.address === address).length === 0) {
        prices = await getHistoricalPriceCoingecko(address)
    } else {
        prices = historicalPrices
    }

    return prices
}

getHistoricalPriceCoingecko = async (address) => {
    // formattedDate = convertDate(date)
    //var formattedDate = moment(date).format("DD-MM-YYYY");
    let formattedAddress = address.toLowerCase()
    // february 1st
    let startDate = new Date('01/01/2020').getTime() / 1000
    let endDate = new Date().getTime() / 1000

    let getAddress = formattedAddress === registry.wethAddress.toLowerCase() ? ADDRESS_ZERO : formattedAddress

    let token = "ethereum"
    if (getAddress != ADDRESS_ZERO) {
        const contractRes = await fetch(
            `https://api.coingecko.com/api/v3/coins/ethereum/contract/${getAddress}`,
        )
        token = ((await contractRes.json())['id'])
    }

    const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${token}/market_chart/range?vs_currency=usd&from=${startDate}&to=${endDate}`
    )
    // const price = ((await res.json())['market_data']['current_price']['usd'])
    // return price
    const prices = ((await res.json())['prices'])

    let objectPrices = prices.reduce(function (p, c) {
        let date = moment.unix(c[0]/1000).format("MM/DD/YY")
        p[date] = c[1];
        return p;
    }, {});

    historicalPrices.push({ address: formattedAddress, prices: objectPrices })

    return historicalPrices
}


getPriceCoingecko = async (address, date) => {
    // formattedDate = convertDate(date)
    var formattedDate = moment(date).format("DD-MM-YYYY");
    if (address === ADDRESS_ZERO) {
        token = "ethereum"
    } else {
        const contractRes = await fetch(
            `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
        )
        token = ((await contractRes.json())['id'])
    }

    const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${token}/history?date=${formattedDate}&localization=false`,
    )
    const price = ((await res.json())['market_data']['current_price']['usd'])
    return price
}

// function convertDate(inputFormat) {
//     function pad(s) { return (s < 10) ? '0' + s : s; }
//     var d = new Date(inputFormat)
//     return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-')
// }

function groupAndSum(array, decimals) {
    var groupedArray = [];
    array.reduce(function (res, v) {
        if (!res[v.date]) {
            res[v.date] = { date: v.date, tokensAmount: 0 };
            groupedArray.push(res[v.date])
        }
        res[v.date].tokensAmount += (parseInt(v.tokensAmount) / 10 ** decimals);
        return res;
    }, {});

    return groupedArray
}
