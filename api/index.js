var argv = require('minimist')(process.argv.slice(2));

const utils = require('./utils');

const registry = require('./registry');

const getTotalInsuranceCoverageDollar = require('./getTotalInsuranceCoverageDollar');
const getInteractedAddresses = require('./getInteractedAddresses');
const getTLV = require('./getTLV');
const getPastTVL = require('./getPastTVL');
const getAllPastTVL = require('./getAllPastTVL');
const get0x = require('./get0xData');


async function getKpi(kpiType, date) {

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

    switch (kpiType) {
        case 'insurance-coverage':
            return getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
        case 'eth-locked':
            return getTLV.getEthLocked(oTokens.concat(oethTokens));
        case 'token-locked':
            return getTLV.getTokenLocked(
                argv.t,
                oTokens.concat(oethTokens)
            )
        case 'usd-locked':
            return getTLV.getTotalDollarLocked(oTokens.concat(oethTokens));
        case 'interacted-addresses':
            return getInteractedAddresses.run(oTokens.concat(oethTokens));
        case 'history':
            return getPastTVL.run(date);
        case 'history-all':
            return getAllPastTVL.run();
        case '0x-data':
            return get0x.run([
                argv.t
            ])
        default:
            return getTotalInsuranceCoverageDollar.run(oTokens.concat(oethTokens));
    }    
    
}


export default {
    getKpi
}
