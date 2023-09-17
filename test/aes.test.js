var assert = require("assert");
const aes = require("../aes");
const blocklib = require("../blocklib");

describe('Test aes functons', function () {
    describe('test sbox value function', function () {
        it('should return 7c for 01',
            function(done){
                aes.init();
                let v = aes._sboxVal(0,1);
                assert.equal(0x7c,v);
                done();
        });
        it('should build the AES sbox',
        function(done){
            aes.init();
            let sb = aes._makeSbox();
            assert.equal(sb[0xf][0],0x8c);
            assert.equal(sb[0x5][0x5],0xfc);
            done();
    });
    });

    describe('test _subValues function', function(){
        let inputs = [
            "00102030405060708090a0b0c0d0e0f0",
            "89d810e8855ace682d1843d8cb128fe4",
            "4915598f55e5d7a0daca94fa1f0a63f7",
            "fa636a2825b339c940668a3157244d17"
        ];
        let expected = [
            "63cab7040953d051cd60e0e7ba70e18c",
            "a761ca9b97be8b45d8ad1a611fc97369",
            "3b59cb73fcd90ee05774222dc067fb68",
            "2dfb02343f6d12dd09337ec75b36e3f0"
        ];
        for(let i = 0; i < inputs.length; i++){
            let inputVal = inputs[i];
            let expectedVal = expected[i];
            it(`should return ${expectedVal} given ${inputVal}`, function(done){
                let inputBlock = blocklib.parseBlock(inputVal);
                assert.equal(16, inputBlock.length, `input block '${inputBlock}' is wrong length`);
                let state = aes._loadState(inputBlock);
                aes.subValues(state);
                let outputBlock = aes._readState(state, null);
                let actualValue = blocklib.blockToString(outputBlock);
                assert.equal(actualValue.toLowerCase(), expectedVal);
                done();
            })
        }
    })
});
