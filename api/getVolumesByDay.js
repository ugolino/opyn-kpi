// Import modules
const utils = require('./utils');
const registry = require('./registry');
const moment = require('moment');

import db from './firebase/db'

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";



export const run = async (tokens) => {
// exports.run = async (tokens) => {

    const historicalPrices = []

    let uniswapFactoryInstance = await utils.initContract(utils.UniswapFactoryAbi, registry.uniswapFactory);  // uniswap factory

    const volumesArray = []

    const getData = async () => {

        return Promise.all(
            tokens.slice().map(async(token, i) => {

                
                let otokenAddress = await token._address; // oToken address
                let otokenName = await token.methods.name().call(); // oToken name
                let otokenDecimals = await token.methods.decimals().call();    // oToken decimals
                let otokenUnderlyingAdd = await token.methods.underlying().call();    // oToken underlying token address
                let otokenStrikeAdd = await token.methods.strike().call();    // oToken strike token address
                let otokenStrikePrice = await token.methods.strikePrice().call();  // oToken strike price

                // check if call
                let isCall = ( otokenUnderlyingAdd == registry.usdcAddress ) ?
                    true :
                    false
                // if call use multiplier
                // let callMultiplier = isCall ? (1 / otokenStrikePrice.value * (otokenStrikePrice.exponent === "-11" ? 100000 : 1000)) : false

                let callMultiplier = isCall ? (1 / otokenStrikePrice.value * (10 ** (-otokenStrikePrice.exponent - otokenDecimals) )) : false

                let tokenAddress = isCall ? otokenStrikeAdd : otokenUnderlyingAdd.toLowerCase()

                
                // get past transactions from Firebase
                const getTokensSoldFromDb = db.collection('tokensSoldTest');
                const tokensSold = await getTokensSoldFromDb.get()
                    .then(function (querySnapshot) {
                        let tokensArray = []
                        querySnapshot.forEach(function (doc) {
                            tokensArray.push(doc.data())
                        });
                        return tokensArray
                })
                const getTokensBoughtFromDb = db.collection('tokensBoughtTest');
                const tokensBought = await getTokensBoughtFromDb.get()
                    .then(function (querySnapshot) {
                        let tokensArray = []
                        querySnapshot.forEach(function (doc) {
                            tokensArray.push(doc.data())
                        });
                        return tokensArray
                    })
                

                // ignore oToken without name
                if (utils.toHex(otokenName) == 0x0) {
                    return;
                }

                let tokenUniswapExchangeAdd = await uniswapFactoryInstance.methods.getExchange(token._address).call(); // oToken uniswap exchange address
                let uniswapExchange = await utils.initContract(utils.UniswapExchangeAbi, tokenUniswapExchangeAdd);  // uniswap exchange for the otoken

                // filter only options for eth, tokens and calls
                if (otokenUnderlyingAdd == ADDRESS_ZERO ||
                    registry.tokens.includes(otokenUnderlyingAdd.toLowerCase()) ||
                    registry.tokens.includes(otokenStrikeAdd.toLowerCase()) ||
                    otokenUnderlyingAdd == registry.usdcAddress
                ) {
                    let id = i + 1

                    let soldEvents = await uniswapExchange.getPastEvents('EthPurchase', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });                    
                    
                    for (let i = 0; i < soldEvents.length; i++) {

                        // update Firebase DB only if transaction is not on DB yet
                        if (tokensSold.filter(transaction => transaction.transactionHash === soldEvents[i].transactionHash ).length === 0 ) {

                            let timestamp = await utils.getDateFromBlock(soldEvents[i].blockNumber)
                            
                            var date = moment.unix(timestamp).format("MM/DD/YY");

                            let tokensAmount = parseInt(soldEvents[i].returnValues.tokens_sold)
                            let block = parseInt(soldEvents[i].blockNumber)
                            let transactionHash = soldEvents[i].transactionHash
                            
                            let address = await utils.getAddressFromTransaction(transactionHash)

                            
                            // get price from Coingecko
                            let assetPrice = await utils.getTokenPrice(historicalPrices, tokenAddress, date)

                            let total = callMultiplier ? ((assetPrice * tokensAmount) / callMultiplier) : (assetPrice * tokensAmount)

                            // update Firebase DB with new transactions
                            await db.collection('tokensSoldTest')
                                .doc(soldEvents[i].transactionHash)
                                .set({
                                    otokenAddress: otokenAddress,
                                    tokensAmount: tokensAmount,
                                    date: date,
                                    block: block,
                                    transactionHash: transactionHash,
                                    assetPrice: assetPrice,
                                    total: total,
                                    address: address
                                })

                        }

                    }


                    // return all transactions from Firebase DB
                    const getUpdatedTokensSoldFromDb = db.collection('tokensSoldTest');
                    const filteredSoldTokensByOtoken = await getUpdatedTokensSoldFromDb.where("otokenAddress", "==", otokenAddress).get()
                        .then(function (querySnapshot) {
                            let tokensArray = []
                            querySnapshot.forEach(function (doc) {
                                tokensArray.push(doc.data())
                            });
                            return tokensArray
                        })

                    // group transactions by date and sum total with same day
                    let groupSoldByDate = utils.groupAndSum(filteredSoldTokensByOtoken, otokenDecimals).sort((a, b) => new Date(a.date) - new Date(b.date))

                    // return total for each day
                    let totalSoldByDate = await Promise.all(groupSoldByDate.map(async function (el) {

                        // let assetPrice = await utils.getTokenPrice(historicalPrices, tokenAddress, el.date)

                        let total = callMultiplier ? ((el.assetPrice * el.tokensAmount) / callMultiplier) : (el.assetPrice * el.tokensAmount)

                        let o = Object.assign({}, el);
                        o.assetPrice = el.assetPrice
                        o.total = total
                        return o;
                    }))

                    // get cumulative data
                    let totCummulativeSold = 0
                    totalSoldByDate.forEach(el =>
                        el.cumulative = totCummulativeSold += el.total
                    )

                    console.log(otokenName, 'totalSoldByDate', totalSoldByDate)




                    let boughtEvents = await uniswapExchange.getPastEvents('TokenPurchase', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });

                    for (let i = 0; i < boughtEvents.length; i++) {

                        // update Firebase DB only if transaction is not on DB yet
                        if (tokensBought.filter(transaction => transaction.transactionHash === boughtEvents[i].transactionHash).length === 0) {

                            let timestamp = await utils.getDateFromBlock(boughtEvents[i].blockNumber)

                            var date = moment.unix(timestamp).format("MM/DD/YY");

                            let tokensAmount = parseInt(boughtEvents[i].returnValues.tokens_bought)
                            let block = parseInt(boughtEvents[i].blockNumber)
                            let transactionHash = boughtEvents[i].transactionHash
                            let address = await utils.getAddressFromTransaction(transactionHash)

                            // get price from Coingecko
                            let assetPrice = await utils.getTokenPrice(historicalPrices, tokenAddress, date)

                            let total = callMultiplier ? ((assetPrice * tokensAmount) / callMultiplier) : (assetPrice * tokensAmount)

                            // update Firebase DB with new transactions
                            await db.collection('tokensBoughtTest')
                                .doc(boughtEvents[i].transactionHash)
                                .set({
                                    otokenAddress: otokenAddress,
                                    tokensAmount: tokensAmount,
                                    date: date,
                                    block: block,
                                    transactionHash: transactionHash,
                                    assetPrice: assetPrice,
                                    total: total,
                                    address: address
                                })

                        }

                    }


                    // return all transactions from Firebase DB
                    const getUpdatedTokensBoughtFromDb = db.collection('tokensBoughtTest');
                    const filteredBoughtTokensByOtoken = await getUpdatedTokensBoughtFromDb.where("otokenAddress", "==", otokenAddress).get()
                        .then(function (querySnapshot) {
                            let tokensArray = []
                            querySnapshot.forEach(function (doc) {
                                tokensArray.push(doc.data())
                            });
                            return tokensArray
                        })

                    // group transactions by date and sum total with same day
                    let groupBoughtByDate = utils.groupAndSum(filteredBoughtTokensByOtoken, otokenDecimals).sort((a, b) => new Date(a.date) - new Date(b.date))

                    // return total for each day
                    let totalBoughtByDate = await Promise.all(groupBoughtByDate.map(async function (el) {

                        // let assetPrice = await utils.getTokenPrice(historicalPrices, tokenAddress, el.date)

                        let total = callMultiplier ? ((el.assetPrice * el.tokensAmount) / callMultiplier) : (el.assetPrice * el.tokensAmount)

                        let o = Object.assign({}, el);
                        o.assetPrice = el.assetPrice
                        o.total = total
                        return o;
                    }))

                    // get cumulative data
                    let totCummulativeBought = 0
                    totalBoughtByDate.forEach(el =>
                        el.cumulative = totCummulativeBought += el.total
                    )

                    console.log(otokenName, 'totalBoughtByDate', totalBoughtByDate)

                    volumesArray.push({ name: otokenName, id: id, totalSoldByDate: totalSoldByDate, totalBoughtByDate: totalBoughtByDate, rawTotalSold: filteredSoldTokensByOtoken, rawTotalBought: filteredBoughtTokensByOtoken })

                }

            })
        )

    }

    let res = await getData().then(() => {
        return volumesArray
    })

    return res


    

}


