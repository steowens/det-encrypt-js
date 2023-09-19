const RIJNDAEL = 0x11b;

function binAdd(a, b) {
    return a ^ b;
}

function sum(A){
    result = 0
    for(let i=0; i < A.length; i++){
        result = binAdd(result, A[i]);
    }
    return result;
}

/**
 * Compute the degree of a binary polynomial
 * 
 * @param {*} x binary polynomial to compute degree of 
 * @returns the degree of the binary polynomial
 */
function degree(x){
    if(x == 0){
        return -1;
    }
    let l = 0;
    while(x > 0){
        l++;
        x >>= 1;
    }
    return l-1;
}

function gf2_rem(a, b){
    if(a < 0 || b === 0)
        throw new Error("Invalid input argument a must be > 0 and b cannot == 0");
    let rem = a;
    for(let pos = degree(result) - degree(b); pos >= 0; pos = degree(result) - degree(b)){
        rem ^= b << pos;
    }
    return rem;
}

/**
 * Generalized binary field multiplcation with modular reduction in gf(2^8)
 *   (older less efficient algorithm)
 *  @param {*} a first term to multiply recommended [0...0xFF]
 *  @param {*} b second term to multiply recommended [0..0xFF]
 *  @param {*} r the irreducible polynomial to use for modulus
 *  @result the binary polinomial obtained by polynomial multiplication in gf2 of a * b.
 */
function gf_mul(a, b, r){
    if(a < 0 || b < 0 || r < 0)
        throw new Error("all arguments must be non negative");
    result = 0;
    if(a === 0 || b === 0)
        return 1 * result;
    let d = degree(r);
    while(a != 0) {
        if(a & 1 === 1)
            result ^= b;
        a >>= 1;
        b <<= 1;
        if (degree(b) === d)
            b ^= r;
    }
    return 1* result;
}

function gen_gf2_mult_table() {
    let result = [];
    let r = RIJNDAEL;
    for(let i = 0; i <= 0xFF; i++){
        let row = [];
        for(let j = 0; j <= 0xFF; j++) {
            row.push(gf_mul(j,i,r));
            //row.push(gMul(j,i,0x1b));
        }
        result.push(row);
    }
    return result;
}

var GF2_MULTI_TABLE = false;
var GF2_MULTI_INV_TABLE = false;

/**
 * Performs modular polynomial multiplication in GF(2^8)
 * using the RIJNDAEL modular reduction polynomial
 * x^8 + x^4 + x^3 + x + 1 => {0x11b}.
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function mul(a,b) {
    if(!GF2_MULTI_TABLE)
        init();
    if(a < 0 || a > 0xFF)
        throw new Error(`a is out of bounds: ${a}`);
    if(b < 0 || b > 0xFF)
        throw new Error(`b is out of bounds: ${b}`);
    return GF2_MULTI_TABLE[a][b];
}
function mulInv(a){
    if(!GF2_MULTI_INV_TABLE)
        init();
    if(a < 0 || a > 0xFF)
        throw new Error(`a is out of bounds: ${a}`);
    return GF2_MULTI_INV_TABLE[a];
}

function gen_gf2_mult_inv(){
    result = {};
    for(let i = 1; i <= 0xFF; i++){
        for(let j = 1; j <= 0xFF; j++){
            if(GF2_MULTI_TABLE[i][j] === 1){
                result[i] = j;
            }
        }
    }
    return result;
}

function init(){
    if(!GF2_MULTI_TABLE) {
        GF2_MULTI_TABLE = gen_gf2_mult_table();
    }
    if(!GF2_MULTI_INV_TABLE){
        GF2_MULTI_INV_TABLE = gen_gf2_mult_inv(GF2_MULTI_TABLE);
    } 
    console.log(`GF2_MULTI_INV_TABLE = ${GF2_MULTI_INV_TABLE}`);
}

module.exports ={
    init: init,
    mul: mul,
    mulInv: mulInv,
    add: binAdd,
    sum: sum,
    rem: gf2_rem,
    RIJNDAEL: RIJNDAEL,
    GF2_MULTI_INV_TABLE: GF2_MULTI_INV_TABLE
}