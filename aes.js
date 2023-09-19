/**
 * Copyright Stephen Owens steve@doitnext.com
 * 
 * Implements AES per https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.197.pdf
 * This is the core of AES encryption algorithms, it performs encryption
 * on a single 128 bit block given either a 128, 192, or 256 bit key.
 * 
 * The AES standard specifies the Rijndael algorithm ([3] and [4]), a symmetric block 
 * cipher that can process data blocks of 128 bits, using cipher keys with lengths of 
 * 128, 192, and 256 bits. Rijndael was designed to handle additional block sizes and 
 * key lengths, however they are not adopted in this standard. 
 * 
*/
const gf2 = require("./gf2");
const shared = require("./shared")
const blockLib = require("./blocklib")

function _newStateBuffer(){
    return Array.of(
        Uint8Array.of(0,0,0,0), 
        Uint8Array.of(0,0,0,0), 
        Uint8Array.of(0,0,0,0), 
        Uint8Array.of(0,0,0,0));
}


function _copyStateBuffer(from){
    let to = _newStateBuffer();
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            from[i][j] = to[i][j];
        }
    }
    return to;
}
/**
 * Loads a flat array of 16 bytes into a given state buffer
 * nist.fips.197.pdf (3.3)
 * @param {*} block a block of 128 bits as a Buffer of bytes 
 * @param {*} state a state buffer like what is created by _newStateBuffer
 *              to re-use a state buffer or nil to create a new one 
 * @returns either the passed in state buffer if provided or a new stateBuffer
 *      initialized with the values from the given block.
 */
function _loadState(block, state) {
    let result = state;
    if(!result)
        result = _newStateBuffer();
    if(block.length != 16)
        throw new Error(`invalid block length: ${block.length} on block ${block}`);
    for(let r = 0; r < 4; r++){
        for(let c = 0; c < 4; c++){
            result[r][c] = block[r + 4*c];
        }
    }
    return result;
}

/**
 * Reads a given state buffer into a given block 
 * nist.fips.197.pdf (3.4)
 * @param {*} block a block of 128 bits as a Buffer of bytes 
 * @param {*} state a state buffer like what is created by _newStateBuffer
 * @returns if block param is not provided returns a new block, else
 *    returns the block passed in. Actual data type returned is a Uint8Array
 */
function _readState(state, block){
    let output = block;
    if(!output)
        output = Uint8Array.from(blockLib.emptyBlock()); 
    if(output.length != 16)
        throw new Error(`invalid block length ${output.length} from ${output}`);
    for(let r = 0; r < 4; r++){
        for(let c = 0; c < 4; c++){
            output[r + 4*c] = state[r][c];
        }
    }
    return output;
}

/**
 * Reference secton 4.3 of nist.fips.197.pdf
 * A word is an array of 4 bytes or 64 bits.  It represents
 * a polynomial of degree 3 in gf(2) with coefficients in the finite
 * field represented by aes GF(2^8).
 * The Modular product a(x) * b(x) is given by the term
 
 * Compute: a(x) * b(x) mod(x^4 + 1)
 * 
 * @param {*} b first polynomial 
 * @param {*} a second polynomial
 */
function mulWords(a, b) {
    const mul = gf2.mul;
    const sum = gf2.sum;
    let d = [
        sum([mul(a[0], b[0]), mul(a[3], b[1]), mul(a[2], b[2]), mul(a[1], b[3])]),
        sum([mul(a[1], b[0]), mul(a[0], b[1]), mul(a[3], b[2]), mul(a[2], b[3])]),
        sum([mul(a[2], b[0]), mul(a[1], b[1]), mul(a[0], b[2]), mul(a[3], b[3])]),
        sum([mul(a[3], b[0]), mul(a[2], b[1]), mul(a[1], b[2]), mul(a[0], b[3])])
    ]
    return d;
}

const HIGH_MASK = 0x80;

const M = [0x8F, 0xC7, 0xE3, 0xF1,
    0xF9, 0x7C, 0x3E, 0x1F ];

/**
 * Get the bit value from a byte at a specific position where
 * position 0 represents the highest order bit and position 7 reprents
 * the lowest order byte.
 * @param {*} byte to read a bit from 
 * @param {*} position bit position in the byte
 * @returns value of the bit either 0 or 1
 */
function getByteAt(byte, position) {
    if(position < 0 || position > 7)
        throw new Error("position out of range for an 8 bit index");
    if(byte & (1 << position))
        return 1;
    else   
        return 0;
}
/**
 * 
 * @param {*} byte to set the bit on 
 * @param {*} position index of where to set the bit where 0 represents the
 *      highest order bit and position 7 reprents
 *      the lowest order byte
 * @param {*} value the value to bit will be set to either 0 if value is falsy or 
 *      1 if value is truthy 
 * @returns the updated byte
 */
function setByteAt(byte, position, value){
    if(position < 0 || position > 7)
        throw new Error("position out of range for an 8 bit index");
    if(value){
        byte |= 1 << position;
    } else {
        byte &= (0xff ^ (1 << position));
    }
    return byte & 0xFF;
}

const AFF_MGK = 0x63;

function _affine(byte) {
    result = 0;
    for(let i = 0; i < 8; i++){
        let bp = getByteAt(byte, i)
                  ^ getByteAt(byte, (i+4)%8)
                  ^ getByteAt(byte, (i+5)%8)
                  ^ getByteAt(byte, (i+6)%8)
                  ^ getByteAt(byte, (i+7)%8)
                  ^ getByteAt(AFF_MGK, i);
        result = setByteAt(result, i, bp);
    }
    return result;
}

// SBOX Construction see:
//   5.1.1 of nist.fips.197.pdf
function _sboxVal(i, j){  
    let x = (i << 4) | j; 
    let minv = gf2.mulInv(x);
    return _affine(minv);
}

var SBOX = null;
function _makeSbox(){
    let sbox = [];
    for(let i = 0; i <= 0xF; i++){
        let row = [];
        for(let j = 0; j <= 0xF; j++){
            let x = (i << 4) | j;
            row.push(_sboxVal(i,j));
        }
        sbox.push(row);
    }
    return sbox;
}
function _sboxRowToString(row){
    let text = "[";
    let prefix = "";
    for(let x = 0; x < row.length; x++){
        text += prefix;
        prefix = ", ";
        text += _toHex(row[x]);
    }
    text += "],\r\n";
    return text;
}
function _sboxToString(sbox){
    let text = "";
    for(let i = 0; i < sbox.length; i++){
        text += _sboxRowToString(sbox[i]);
    }
    return text;
}

function init(){
    gf2.init();
    if(!SBOX){
        SBOX = _makeSbox();
    }
}
/**
 * Performs the 
 * a state as defined in section section 3.4
 * @param {*} state a 4x4 Array of Uint8
 */
function subValues(state){
    if(!SBOX) {
        init();
    }
    for(let i = 0; i < state.length; i++){
        for(let j = 0; j < state.length; j++) {
            let byte = state[i][j];
            let x = (byte & 0xFF) >> 4;
            let y = (byte & 0x0F);
            let subByte = SBOX[x][y];
            state[i][j] = subByte;
        }
    }
}

/**
 * Does a shiftRows operation per nist.fips.197.pdf Sub section 5.1.2
 * nothing fancy here, we have a constant allocated buffer to allow the 
 * source data to be copied out in the right order.  Each element is copied
 * exactly twice per row.  Nothing fancy and the algorithm will operate
 * within most CPU L1 cache and copying data there is lightning quick.
 * @param {*} state to operate on
 */
const copyBuffer = new Uint8Array(4);
function shiftRows(state){
    for(let r = 0; r < 4; r++){
        for(let c = 0; c < 4; c++){
            copyBuffer[c] = state[r][(c + r)%4]; 
        }
        for(let c = 0; c < 4; c++){
            state[r][c] = copyBuffer[c];
        }
    }
}



const stateBuffer = _newStateBuffer();
/**
 * per nist.fips.197.pdf Sub section 5.1.3 MixColumns() Transformation
 * The MixColumns() transformation operates on the State column-by-column, treating each
 * column as a four-term polynomial as described in Sec. 4.3. The columns are considered as
 * polynomials over GF(28) and multiplied modulo x^4 + 1 with a fixed polynomial a(x), given by
 *   a(x) = {03}x^3 + {01}x^2 + {01}x + {02} 
 * 
 * @param {*} state the state containing the columns
 */
function mixColumns(state) {
    for(let c = 0; c < 4; c++){
        _copyStateBuffer(state, stateBuffer);
        state[0][c] = gf2.mul(0x02, stateBuffer[0][c]) ^ gf2.mul(0x03, stateBuffer[1][c]) ^ stateBuffer[2][c] ^ stateBuffer[3][c];
        state[1][c] = stateBuffer[0][c] ^ gf2.mul(0x02, stateBuffer[1][c]) ^ gf2.mul(0x03, stateBuffer[2][c]) ^ stateBuffer[3][c];
        state[2][c] = stateBuffer[0][c] ^ stateBuffer[1][c] ^ gf2.mul(0x02, stateBuffer[2][c]) ^ gf2.mul(0x03, stateBuffer[3][c]);
        state[2][c] = gf2.mul(0x03, stateBuffer[0][c]) ^ stateBuffer[1][c] ^ stateBuffer[2][c] ^ gf2.mul(0x02, stateBuffer[3][c]);
    }
}

module.exports = {
    init: init,
    subValues: subValues,
    shiftRows: shiftRows,
    mixColumns: mixColumns,
    _sboxVal: _sboxVal,
    _makeSbox: _makeSbox,
    _sboxToString: _sboxToString,
    _newStateBuffer: _newStateBuffer,
    _loadState:_loadState,
    _readState:_readState,
    _copyStateBuffer:_copyStateBuffer
}



