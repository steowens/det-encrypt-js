var assert = require("assert");
const gf2 = require("../gf2");

describe('Test gf2', function () {
    describe('Test polynomial multiplication in GF(2^8)', () => {
        it('should return correct value for polynomial multiplication', () => {
            gf2.init();
            let triplets = [
                [0x00, 0x00, 0x00],
                [0x57, 0x13, 0xfe],
                [156, 12, 202],
                [32, 255, 210],
                [5, 5, 17]
            ];
            for(let i = 0; i < triplets.length; i++){
                let row = triplets[i];
                let a = row[0];
                let b = row[1];
                let c = gf2.mul(a, b); 
                assert.equal(c, row[2], `${a} * ${b} = ${c} `);
            }
        });
        
    })
});

