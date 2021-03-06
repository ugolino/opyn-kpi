// Import modules
const utils = require('./utils');
const registry = require('./registry');

const ADDRESS_ZERO = 0x0000000000000000000000000000000000000000;

let coverageInsuranceArray = []

// calculate oToken bought
calculateInsuranceBought = (totalSupply, uniswapBalance, balance1, balance2) => {
    return totalSupply - uniswapBalance - balance1 - balance2;
}

// calculare total oTokens insurance coverage in $
calculateInsuranceInDollar = (oTokensInsurance) => {
    let InsuranceBoughtDollar = 0;
    for(let i=0; i<oTokensInsurance.length; i++) {
        InsuranceBoughtDollar += oTokensInsurance[i];
    }
    return InsuranceBoughtDollar;
}

getCompoundInsuranceDollar = async (octoken, name, decimals, octokenExchangeAdd, add1, add2, ctokenToToken) => {
    let octokenTotalSupply = await utils.getTotalSupply(octoken) / 10**decimals;
    let octokenUniswapBalance = await utils.getBalance(octoken, octokenExchangeAdd) / 10**decimals;
    let octokenBalance1 = await utils.getBalance(octoken, add1) / 10**decimals;
    let octokenBalance2 = await utils.getBalance(octoken, add2) / 10**decimals;

    // ocUsdc total bought
    let ocUsdcBought = calculateInsuranceBought(octokenTotalSupply, octokenUniswapBalance, octokenBalance1, octokenBalance2);

    let insuranceBoughtDollar = ocUsdcBought * ctokenToToken;

    console.log(name, "insurance coverage bought in $: ", insuranceBoughtDollar);

    coverageInsuranceArray.push({
        name: name,
        value: insuranceBoughtDollar,
        currency: "USD"
    })

    return insuranceBoughtDollar;    
}

getOcrvInsuranceDollar = async (ocrv, name, decimals, oCrvExchangeAdd, add1, add2, yTokenToUsd) => {
    let ocCrvTotalSupply = await utils.getTotalSupply(ocrv) / 10**decimals;
    let oCrvUniswapBalance = await utils.getBalance(ocrv, oCrvExchangeAdd) / 10**decimals;
    let oCrvBalance1 = await utils.getBalance(ocrv, add1) / 10**decimals;
    let oCrvBalance2 = await utils.getBalance(ocrv, add2) / 10**decimals;    

    // oCrv total bought
    let oCrvBought = calculateInsuranceBought(ocCrvTotalSupply, oCrvUniswapBalance, oCrvBalance1, oCrvBalance2);

    let insuranceBoughtDollar = oCrvBought * yTokenToUsd;

    console.log(name, "insurance coverage bought in $: ", insuranceBoughtDollar);

    coverageInsuranceArray.push({
        name: name,
        value: insuranceBoughtDollar,
        currency: "USD"
    })

    return insuranceBoughtDollar
}

getOethPutInsuranceDollar = async (oEth, name, decimals, oEthExchangeAdd, add1, add2, ethToUsd) => {
    let oEthTotalSupply = await utils.getTotalSupply(oEth) / 10**decimals;
    let oEthUniswapBalance = await utils.getBalance(oEth, oEthExchangeAdd) / 10**decimals;
    let oEthBalance1 = await utils.getBalance(oEth, add1) / 10**decimals;
    let oEthBalance2 = await utils.getBalance(oEth, add2) / 10**decimals;

    console.log('oEthTotalSupply', oEthTotalSupply, 
        'oEthUniswapBalance', oEthUniswapBalance, 
        'oEthBalance1', oEthBalance1,
        'oEthBalance2', oEthBalance2
    )

    let oEthBought = calculateInsuranceBought(oEthTotalSupply, oEthUniswapBalance, oEthBalance1, oEthBalance2);

    let cummOethBoughtDollar = (oEthTotalSupply * ethToUsd / 1e18);
    let insuranceBoughtDollar = (oEthBought * ethToUsd / 1e18);

    console.log(name, "insurance coverage bought in $: ", insuranceBoughtDollar, "cummulative insurance bought:", cummOethBoughtDollar );

    coverageInsuranceArray.push({
        name: name,
        value: insuranceBoughtDollar,
        currency: "USD"
    })

    return insuranceBoughtDollar;
}

getOethCallInsuranceDollar = async (oEth, name, decimals, oEthExchangeAdd, add1, add2, ethToUsd, otokenStrikePrice, otokenDecimals) => {
    let oEthTotalSupply = await utils.getTotalSupply(oEth) / 10**decimals;
    let oEthUniswapBalance = await utils.getBalance(oEth, oEthExchangeAdd) / 10**decimals;
    let oEthBalance1 = await utils.getBalance(oEth, add1) / 10**decimals;
    let oEthBalance2 = await utils.getBalance(oEth, add2) / 10**decimals;


    let oethToEth = (1 / otokenStrikePrice.value * (10 ** (-otokenStrikePrice.exponent - otokenDecimals)));

    let oEthBought = calculateInsuranceBought(oEthTotalSupply, oEthUniswapBalance, oEthBalance1, oEthBalance2);
    let insuranceBoughtDollar = (oEthBought * ethToUsd / 1e18) / oethToEth;
    console.log(name, "insurance coverage bought in $: ", insuranceBoughtDollar);

    coverageInsuranceArray.push({
        name: name,
        value: insuranceBoughtDollar,
        currency: "USD"
    })

    return insuranceBoughtDollar;
}

getTokenPutInsuranceDollar = async (oToken, name, decimals, oTokenExchangeAdd, add1, add2, otokenUnderlyingAdd) => {
    let oTokenTotalSupply = await utils.getTotalSupply(oToken) / 10 ** decimals;
    let oTokenUniswapBalance = await utils.getBalance(oToken, oTokenExchangeAdd) / 10 ** decimals;
    let oTokenBalance1 = await utils.getBalance(oToken, add1) / 10 ** decimals;
    let oTokenBalance2 = await utils.getBalance(oToken, add2) / 10 ** decimals;

    let tokenToUsd = await getTokenPriceCoingecko(otokenUnderlyingAdd)

    console.log(`oTokenTotalSupply: ${oTokenTotalSupply}, 
    oTokenUniswapBalance: ${oTokenUniswapBalance}, 
    oTokenBalance1: ${oTokenBalance1}, 
    oTokenBalance2: ${oTokenBalance2},  
    tokenToUsd: ${tokenToUsd}`)

    let oTokenBought = calculateInsuranceBought(oTokenTotalSupply, oTokenUniswapBalance, oTokenBalance1, oTokenBalance2);
    let insuranceBoughtDollar = (oTokenBought * tokenToUsd);

    console.log(name, "insurance token coverage bought in $: ", insuranceBoughtDollar);

    coverageInsuranceArray.push({
        name: name,
        value: insuranceBoughtDollar,
        currency: "USD"
    })

    return insuranceBoughtDollar;
}


getTokenPriceCoingecko = async (token) => {
    let price = 0
    if (token === ADDRESS_ZERO ) {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
        )
        price = (await res.json())['ethereum'].usd      
    } else {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token}&vs_currencies=usd`,
        )
        price = (await res.json())[token.toLowerCase()].usd
    }
    return price
}


exports.run = async (otokens) => {

    // cDai token instance
    const cdaiInstance = await utils.initContract(utils.cDaiAbi, registry.cDaiAddress);
    // cUsdc token instance
    const cusdcInstance = await utils.initContract(utils.cUsdcAbi, registry.cUsdcAddress);
    // curvefi contract (ytoken exchange rate)
    const curvefiSwapInstance = await utils.initContract(utils.CurvefiSwapAbi, registry.curvefiSwapAddress);
    // Uniswap Factory instance
    const uniswapFactoryInstance = await utils.initContract(utils.UniswapFactoryAbi, registry.uniswapFactory);
    // Maker Medianizer contract (ETH/USD oracle)
    const makerMedianizerInstance = await utils.initContract(utils.MakerMedianizerAbi, registry.makerMedianizerAddress);   

    // cDai to Dai exchange rate
    const cdaiToDai = await cdaiInstance.methods.exchangeRateStored().call() / 1e28;
    // cUsdc to Usdc exchange rate
    const cusdcToUsdc = await cusdcInstance.methods.exchangeRateStored().call() / 1e16;
    // yToken exchange rate
    const yTokenToUsd = await curvefiSwapInstance.methods.get_virtual_price().call() / 1e18;
    // ETH/USD price
    // const ethToUsd = await utils.getMakerEthUsd(makerMedianizerInstance);

    const ethToUsd = await getTokenPriceCoingecko(ADDRESS_ZERO)


    let oTokensInsuranceBoughtDollar = [];

    for(let i=0; i<otokens.length; i++) {
        let otokenName = await otokens[i].methods.name().call();    // oToken name

        console.log(otokenName)

        // ignore oToken without name
        if(utils.toHex(otokenName) == 0x0) {
            continue;
        }

        let otokenDecimals = await otokens[i].methods.decimals().call();    // oToken decimals
        let otokenUnderlyingAdd = await otokens[i].methods.underlying().call();    // oToken underlying token address
        let otokenStrikeAdd = await otokens[i].methods.strike().call();    // oToken strike token address
        let otokenStrikePrice = await otokens[i].methods.strikePrice().call();  // oToken strike price
        let otokenUniswapExchangeAdd = await uniswapFactoryInstance.methods.getExchange(otokens[i]._address).call(); // oToken uniswap exchange address



        if(otokenUnderlyingAdd == ADDRESS_ZERO) {
            oTokensInsuranceBoughtDollar.push(
                await getOethPutInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd, 
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    ethToUsd
                )
            );
        }

        else if((otokenStrikeAdd == ADDRESS_ZERO) && (otokenUnderlyingAdd == registry.usdcAddress)) {
            oTokensInsuranceBoughtDollar.push(
                await getOethCallInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd, 
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    ethToUsd,
                    otokenStrikePrice,
                    otokenDecimals
                )
            );
        }

        else if(otokenUnderlyingAdd == registry.cDaiAddress) {
            oTokensInsuranceBoughtDollar.push(
                await getCompoundInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd, 
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    cdaiToDai
                )
            );
        }

        else if(otokenUnderlyingAdd == registry.cUsdcAddress) {
            oTokensInsuranceBoughtDollar.push(
                await getCompoundInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd, 
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    cusdcToUsdc
                )
            );
        }

        else if(otokenUnderlyingAdd == registry.yDai) {
            oTokensInsuranceBoughtDollar.push(
                await getOcrvInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd, 
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    yTokenToUsd
                )
            );
        }

        

        else if (registry.tokens.includes(otokenUnderlyingAdd.toLowerCase())) {
             
            console.log(`else: ${otokenName}`)

            oTokensInsuranceBoughtDollar.push(
                await getTokenPutInsuranceDollar(
                    otokens[i],
                    otokenName,
                    otokenDecimals,
                    otokenUniswapExchangeAdd,
                    "0x9e68B67660c223B3E0634D851F5DF821E0E17D84",
                    "0x076C95c6cd2eb823aCC6347FdF5B3dd9b83511E4",
                    otokenUnderlyingAdd
                )
            );
            

           
        }

    }

    // console.log("Total oToken insurance bought in $: ", calculateInsuranceInDollar(oTokensInsuranceBoughtDollar));

    // return calculateInsuranceInDollar(oTokensInsuranceBoughtDollar)

    coverageInsuranceArray.push({
        name: 'Total',
        value: calculateInsuranceInDollar(oTokensInsuranceBoughtDollar),
        currency: "USD"
    })

    console.log(coverageInsuranceArray)

    return coverageInsuranceArray
    
}