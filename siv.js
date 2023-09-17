const blocklib = require("./blocklib");

/*
* Copyright 2023 Stephen Owens all rights reserved.
*/

/**
 * Performs the RFC5297 Doubling operation (sec 2.3)
 * 
 * @param {*} block a 128 bit string represented as a Uint32 array, block
 * is modified by the function call.
 */
function _double(block){
    let toCarry = blocklib.shiftLeft128(block);
    if(toCarry) {
        block[block.length - 1] = block[block.length - 1] ^ 0x87;
    }
    return toCarry;
}

module.exports = {
    _double: _double
}