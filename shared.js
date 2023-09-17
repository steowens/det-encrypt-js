const HEXCHARS = ['0', '1', '2', '3',
    '4', '5', '6', '7', 
    '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F'];

const HEXMAP = {
    '0':0, '1':1, '2':2, '3':3,
    '4':4, '5':5, '6':6, '7':7, 
    '8':8, '9':9, 'A':0xA, 'B':0xB,
    'C':0xC, 'D':0xD, 'E':0xE, 'F':0xF
}


/**
 * 
 * @param {*} byte a signle unsigned integer between 0 and 0xFF 
 * @returns the hexadecimal representation of this integer as a string.
 */
function toHex(byte){
    if(byte < 0 || byte > 0xFF)
        throw new Error("byte value out of range");
    a = HEXCHARS[byte >> 4];
    b = HEXCHARS[(byte & 0xF)];
    return `${a}${b}`;
}

/**
 * Array fetch without out of bounds exceptions returns undefined for
 * elements out of the index range for the array.
 * @param {*} theArray to get an element from 
 * @param {*} index the index of the elemet to get
 * @returns if the index is out of bounds returns undefined otherwise
 *      returns the array element at the given index
 */
function arrayGet(theArray, index){
    if(index < 0 || index >= theArray.length)
        return undefined;
    return theArray[index];
}


/**
 * Parses a hexadecimal string of the form "AFBE09..." to return a given
 * number of bytes from the string.
 * @param {*} hexval the hexadecimal string to parse hexval.length must be >= numbBytes * 2
 * @param {*} numBytes the number of bytes to return
 * @param {*} seps an optional regex that can be used to strip out spacing and such
 * @returns the buffer of bytes parsed from the hex string
 */
function parseHexVal(hexString, numBytes, seps){
    if(typeof(hexString) != "string")
        throw new Error("Invalid data type for hex string");
    if(seps){
        hexString = hexString.replaceAll(seps, "");
    }
    hexString = hexString.toUpperCase();
    if(hexString.length < numBytes *2)
        throw new Error("invalid input string length for given buffer");
    let result = new Uint8Array(numBytes);
    for(let x = 0, i = 0; x < numBytes*2; x += 2, i++){
        h = HEXMAP[hexString.charAt(x)];
        l = HEXMAP[hexString.charAt(x+1)];
        result[i] = (h << 4) | l;
    }
    return result;
}

/**
 * Formats a buffer of bytes as a hexadecimal string compatible with 
 * parseHexVal.
 * @param {*} bytes to be formatted 
 * @param {*} optinal seperator string between bytes
 * @returns the hexadecimal string that encodes the given bytes array
 */
function bytesToHex(bytes, sep){
    let buffer = Uint8Array.from(bytes);
    let result = "";
    prefix = "";
    for(let x = 0; x < bytes.length; x++){
        result += prefix;
        let byte = buffer[x];
        result += toHex(byte);
        if(sep)
            prefix = sep;
    } 
    return result;
}

module.exports = {
    intToHexChar:(i) => arrayGet(HEXCHARS,i),
    hexCharToInt:(char) => HEXMAP[char],
    toHex:toHex,
    parseHexVal:parseHexVal,
    bytesToHex:bytesToHex
}