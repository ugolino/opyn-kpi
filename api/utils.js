// Import modules
const Web3 = require('web3');
const registry = require('./registry');
const fetch = require("node-fetch");
const moment = require('moment');

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";


// require('dotenv').config()


// connect to Infura
const rpcUrl = process.env.VUE_APP_INFURA_ENDPOINT || '';
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// init contract object
exports.initContract = async (abi, address) => {
    return new web3.eth.Contract(abi, address);
}

// get token total supply
exports.getTotalSupply = async (token) => {
    return await token.methods.totalSupply().call();
}

// get address balance of a specific token
exports.getBalance = async (token, holder) => {
    return await token.methods.balanceOf(holder).call();
}

// get token decimals
exports.getDecimals = async (token) => {
    return await token.methods.decimals().call();
}

// get ETH/USD price
exports.getMakerEthUsd = async (maker) => {
    return web3.utils.hexToNumberString(await maker.methods.read().call());
}

// get address ETH balance
exports.getEthBalance = async(address) => {
    return web3.utils.fromWei(await web3.eth.getBalance(address), "ether");
}

exports.toHex = (string) => {
    return web3.utils.toHex(string);
}

// get date from block
exports.getDateFromBlock = async (blockNumber) => {
    let block = await web3.eth.getBlock(blockNumber)
    return block.timestamp
}

// get date from block
exports.getAddressFromTransaction = async (transactionHash) => {
    let transaction = await web3.eth.getTransaction(transactionHash)
    return transaction.from
}

// Import ABIs
exports.oTokenAbi = require('../ABI/oToken.json');
exports.cDaiAbi = require('../ABI/cDai.json');
exports.cUsdcAbi = require('../ABI/cUsdc.json');
exports.MakerMedianizerAbi = require('../ABI/MakerMedianizer.json');
exports.CurvefiSwapAbi = require('../ABI/CurvefiSwap.json');
exports.OptionsExchangeAbi = require('../ABI/OptionsExchange.json');
exports.OptionsFactoryAbi = require('../ABI/OptionsFactory.json');
exports.OptionsContractAbi = require('../ABI/OptionsContract.json')
exports.UniswapFactoryAbi = require('../ABI/UniswapFactory.json')
exports.UniswapExchangeAbi = require('../ABI/UniswapExchange.json')

let self = this

exports.getTokenPrice = async (historicalPrices, address, date) => {
    let formattedAddress = address.toLowerCase()
    // let tokenAddress = address === registry.wethAddress ? ADDRESS_ZERO : formattedAddress
    prices = await self.checkHistoricalPrices(historicalPrices, formattedAddress)

    let pricesByAddress = prices.filter(addr => addr.address === formattedAddress)[0].prices


    price = Object.keys(pricesByAddress)
        .filter(key =>
            moment(date).format("DD-MM-YYYY") === moment(key).format("DD-MM-YYYY")
        ).reduce((obj, key) => {
            obj[key] = pricesByAddress[key];
            return obj;
        }, {})

    return Object.values(price)[0] ? Object.values(price)[0] : 0

}

exports.checkHistoricalPrices = async (historicalPrices, address) => {
    if (historicalPrices.filter(addr => addr.address === address).length === 0) {
        prices = await self.getHistoricalPriceCoingecko(historicalPrices, address)
    } else {
        prices = historicalPrices
    }

    return prices
}

exports.getHistoricalPriceCoingecko = async (historicalPrices, address) => {
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
        let date = moment.unix(c[0] / 1000).format("MM/DD/YY")
        p[date] = c[1];
        return p;
    }, {});

    historicalPrices.push({ address: formattedAddress, prices: objectPrices })

    return historicalPrices
}


exports.getPriceCoingecko = async (address, date) => {
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



exports.groupAndSum = (array, decimals) => {
    var groupedArray = [];
    array.reduce(function (res, v) {
        if (!res[v.date]) {
            res[v.date] = { date: v.date, tokensAmount: 0, assetPrice: v.assetPrice };
            groupedArray.push(res[v.date])
        }
        res[v.date].tokensAmount += (parseInt(v.tokensAmount) / 10 ** decimals);
        return res;
    }, {});

    return groupedArray
}