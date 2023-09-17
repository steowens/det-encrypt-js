/**
 * Copyright Stephen Owens steve@doitnext.com
 * 
 * Implements block functions.
 * 
 * Type checking is not performed, so make sure you are aware
 * of expected input types.
 * 
 * Note on naming conventions:
 *    parameter name block implies a Uint32Array[4] representing
 *    a 128 bit string. Most block operations will be performed on 
 *    register types.
    
 */
const shared = require("./shared")
const logging = require("./logging");



/**
 * 
 * @returns a 128 bit register consisting of all zeros.
 */
function fullBlock() {
    let result = new Uint8Array(16);
    for(let x = 0; x < 16; x++)
        result[x] = 0xFF;
    return result;
}

/**
 * 
 * @returns a 128 bit register consisting of all ones.
 */
function emptyBlock() {
    return new Uint8Array(16);
}

function parseBlock(hexString){
    return shared.parseHexVal(hexString, 16, /[ ,\t]+/g);
}

function blockToString(block, sep){
    return shared.bytesToHex(block, sep);
}

function _computeCarries(block) {
    let carries = new Uint8Array(block.length);
    for(let x = 0; x < block.length; x++){
       let byte = block[x];
       carries[x] = (byte & 0x80) ? 1 : 0;
    }  
    return carries;  
}

/**
 * Shifts a 128 bit byte string left by one bit
 * addresses carry operations on the shifted values.
 * 
 * @param {} block 
 * @return {*} 1 if the high order bit was 1 before the shift
 *             0 if the high order bit was 0 before the shift
 */
function shiftLeft128(block) {
    if(block.length != 16)
        throw new Error(`invalid block length block = '${block}'`)
    let carries = _computeCarries(block);
    logging.debug(`carries: ${carries}`);
    for(let x = 0; x < 15; x++) {
        block[x] = (block[x] << 1) | carries[x+1];
    }
    block[15] = block[15] << 1;
    return carries[0];
}

module.exports = {
    emptyBlock: emptyBlock,
    fullBlock: fullBlock,
    shiftLeft128: shiftLeft128,
    parseBlock: parseBlock,
    blockToString: blockToString,
    _computeCarries: _computeCarries
}