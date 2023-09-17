var assert = require("assert");
const siv = require("../siv");
const shared = require("../shared");

describe('Test _double', function () {
    describe('double with high bit set with xor', function () {
        let givens = [
            "C0000001C0010101C0010101C0010101",
            "40000001400101014001010140010101"
        ];
        let expecteds = [
            "80000003800202038002020380020285",
            "80000002800202028002020280020202"
        ];
        for(let x = 0; x < givens.length; x++){
            let given = givens[x];
            let expected = expecteds[x];
            it('should shift correctly and mask at the end on a carry', 
                function () {
                let block = shared.parseHexVal(given,16)
                siv._double(block);
                let actual = shared.bytesToHex(block);
                assert.equal(actual, expected);
            });
        }
    });
});