// Import modules
const utils = require('./utils');
const registry = require('./registry');

// get list of unique addresses that interacted with a specific oToken (sent or received an oToken)
// to get the number of addresses => addresses.length
exports.run = async (tokens) => {
    let uniswapFactoryInstance = await utils.initContract(utils.UniswapFactoryAbi, registry.uniswapFactory);  // uniswap factory
    let totalAddresses = [];

    for (let j = tokens.length - 1; j >= 0; j--) {
        // for (let j = tokens.length; j<tokens.length; j--) {
        let addresses = []; // interacted addresses for each oToken
        let otokenName = await tokens[j].methods.name().call(); // oToken name
        let otokenStrikePrice = await otokens[i].methods.strikePrice().call();  // oToken strike price

        tokensSold = []
        tokensBought = []

        // ignore oToken without name
        if (utils.toHex(otokenName) == 0x0) {
            continue;
        }

        let tokenUniswapExchange = await uniswapFactoryInstance.methods.getExchange(tokens[j]._address).call(); // oToken uniswap exchange address

        // get all past Transfer events
        let transferEvent = await tokens[j].getPastEvents('Transfer', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        // loop through events & remove deplicated one + mint events
        for (let i = 0; i < transferEvent.length; i++) {

            if (transferEvent[i].returnValues.to == tokenUniswapExchange) {

                let timestamp = await utils.getDateFromBlock(transferEvent[i].blockNumber)

                let date = new Date(timestamp * 1000).toDateString();

                tokensSold.push({ date: date, value: transferEvent[i].returnValues.value })
            }

            if (transferEvent[i].returnValues.from == tokenUniswapExchange) {

                let timestamp = await utils.getDateFromBlock(transferEvent[i].blockNumber)

                let date = new Date(timestamp * 1000).toDateString();

                tokensBought.push({ date: date, value: transferEvent[i].returnValues.value })
            }


            if (
                (transferEvent[i].returnValues.from != tokenUniswapExchange)
                && (transferEvent[i].returnValues.from != "0x0000000000000000000000000000000000000000")
            ) {

                addresses.push(transferEvent[i].returnValues.from);

                if (!totalAddresses.includes(transferEvent[i].returnValues.from)) totalAddresses.push(transferEvent[i].returnValues.from);
            }

            if (
                (transferEvent[i].returnValues.to != tokenUniswapExchange)
                && (transferEvent[i].returnValues.to != "0x0000000000000000000000000000000000000000")
            ) {

                addresses.push(transferEvent[i].returnValues.to);

                if (!totalAddresses.includes(transferEvent[i].returnValues.to)) totalAddresses.push(transferEvent[i].returnValues.to);
            }
        }

        console.log("tokensSold :", tokensSold, "tokensBought :", tokensBought)

        let totalTokensSold = tokensSold.reduce((a, { value }) => a + parseInt(value), 0) / 1e18;
        let totalTokensBought = tokensBought.reduce((a, { value }) => a + parseInt(value), 0) / 1e18;


        console.log(otokenName, ":", addresses.length, "address", "total tokensSold :", totalTokensSold * otokenStrikePrice, "total tokensBought :", totalTokensBought * otokenStrikePrice)

    }

    console.log("Total: ", totalAddresses.length);
}


