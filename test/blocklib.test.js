var assert = require("assert");
const blocklib = require("../blocklib");
const shared = require("../shared");

describe('Test blocklib internals', function () {
    describe('test parseBlock', function(){
        let givens = [
            "C0 00 00 01 C0 01 01 01 C0 01 01 01 C0 01 01 01"
        ];
        let expecteds = [
            "C0, 00, 00, 01, C0, 01, 01, 01, C0, 01, 01, 01, C0, 01, 01, 01"
        ];
        for(let x = 0; x < givens.length; x++){
            let given = givens[x];
            let expected = expecteds[x];
            it(`return ${expected} for ${given}`, function(done){
                let block = blocklib.parseBlock(given);
                let actual = shared.bytesToHex(block, ", ");
                assert.equal(actual, expected, `on '${block}'`);
                done();
            });
        }
    });
    describe('test _computeCarries', function () {
        let givens = [
            "C0 00 00 01 C0 01 01 01 C0 01 01 01 C0 01 01 01"
        ];
        let expecteds = [
            "01 00 00 00 01 00 00 00 01 00 00 00 01 00 00 00"
        ];
        for(let x = 0; x < givens.length; x++){
            let given = givens[x];
            let expected = expecteds[x];
            it(`return the correct carries array for ${given}`, 
                function (done) {
                let block = blocklib.parseBlock(given);
                let blockStr = shared.bytesToHex(block, ' ');
                let carries = blocklib._computeCarries(block);
                let actual = shared.bytesToHex(carries, ' ');
                assert.equal(actual, expected, `on '${blockStr}'`);
                done();
            });
        }
    });
});