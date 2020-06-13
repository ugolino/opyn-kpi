var argv = require('minimist')(process.argv.slice(2));

const utils = require('./utils');

const registry = require('./registry');

const getTotalInsuranceCoverageDollar = require('./getTotalInsuranceCoverageDollar');
const getInteractedAddresses = require('./getInteractedAddresses');
const getTLV = require('./getTLV');
const getPastTVL = require('./getPastTVL');
const get0x = require('./get0xData');


async function getKpi(kpiType) {

    // opyn tokens array
    let oTokens = [];
    let oethTokens = [];

    // get factory instance
    let factoryInstance1 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[0]);  // ocDai,ocUsdc,Ocrv factory
    let factoryInstance2 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[1]);  // oEth factory

    // get number of oTokens
    let oTokenCounter = await factoryInstance1.methods.getNumberOfOptionsContracts().call();    // ocDai,ocUsdc,oCrv
    let oethTokensCounter = await factoryInstance2.methods.getNumberOfOptionsContracts().call();    // oEth 

    // get tokens instances
    for (let i = 0; i < oTokenCounter; i++) {
        oTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance1.methods.optionsContracts(i).call()
            )
        );
    }
    for (let i = 0; i < oethTokensCounter; i++) {
        oethTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance2.methods.optionsContracts(i).call()
            )
        );
    }

    console.log(kpiType)

    switch (kpiType) {
        case 'insurance-coverage':
            console.log("case 'insurance-coverage':")
            return getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
        case 'eth-locked':
            console.log("case 'eth-locked'")
            return getTLV.getEthLocked(oTokens.concat(oethTokens));
        case 'token-locked':
            console.log("'token-locked'")
            return getTLV.getTokenLocked(
                argv.t,
                oTokens.concat(oethTokens)
            )
        case 'usd-locked':
            console.log("case 'token-locked'")
            return getTLV.getTotalDollarLocked(oTokens.concat(oethTokens));
        case 'interacted-addresses':
            return getInteractedAddresses.run(oTokens.concat(oethTokens));
        case 'history':
            return getPastTVL.run(argv.d);
        case '0x-data':
            return get0x.run([
                argv.t
            ])
        default:
            return getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
    }    
    

}



// run
async function runKpi(requestType) {

    // opyn tokens array
    let oTokens = [];
    let oethTokens = [];


    // get factory instance
    let factoryInstance1 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[0]);  // ocDai,ocUsdc,Ocrv factory
    let factoryInstance2 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[1]);  // oEth factory

    // get number of oTokens
    let oTokenCounter = await factoryInstance1.methods.getNumberOfOptionsContracts().call();    // ocDai,ocUsdc,oCrv
    let oethTokensCounter = await factoryInstance2.methods.getNumberOfOptionsContracts().call();    // oEth 


    // get tokens instances
    for (let i=0; i<oTokenCounter; i++) {
        oTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance1.methods.optionsContracts(i).call()
            )
        ); 
    }
    for (let i=0; i<oethTokensCounter; i++) {
        oethTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance2.methods.optionsContracts(i).call()
            )
        );
    }

    switch (requestType) {
        case 'insurance-coverage':
            getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
            break;
        case 'eth-locked':
            getTLV.getEthLocked(oTokens.concat(oethTokens));
            break;
        case 'token-locked':
            getTLV.getTokenLocked(
                argv.t, 
                oTokens.concat(oethTokens)
            )
            break;
        case 'usd-locked':
            getTLV.getTotalDollarLocked(oTokens.concat(oethTokens));
            break;
        case 'interacted-addresses':
            getInteractedAddresses.run(oTokens.concat(oethTokens));
            break;
        case 'history':
            getPastTVL.run(argv.d);
            break;
        case '0x-data':
            get0x.run([
                argv.t
            ])
            break;
        default:
            await getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
    }      
}

// runKpi();

export default {
    runKpi,
    getKpi
}
