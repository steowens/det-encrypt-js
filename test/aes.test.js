var assert = require("assert");
const aes = require("../aes");
const blocklib = require("../blocklib");

const testInputs128 = {
    input:"00112233445566778899aabbccddeeff",
    output:"69c4e0d86a7b0430d8cdb78070b4c55a",
    ksch:[
        "000102030405060708090a0b0c0d0e0f",
        "d6aa74fdd2af72fadaa678f1d6ab76fe",
        "b692cf0b643dbdf1be9bc5006830b3fe",
        "47f7f7bc95353e03f96c32bcfd058dfd",
        "3caaa3e8a99f9deb50f3af57adf622aa",
        "5e390f7df7a69296a7553dc10aa31f6b",
        "14f9701ae35fe28c440adf4d4ea9c026",
        "47438735a41c65b9e016baf4aebf7ad2",
        "549932d1f08557681093ed9cbe2c974e",
        "13111d7fe3944a17f307a78b4d2b30c5"
    ],
    starts:[
        "00102030405060708090a0b0c0d0e0f0",
        "89d810e8855ace682d1843d8cb128fe4",
        "4915598f55e5d7a0daca94fa1f0a63f7",
        "fa636a2825b339c940668a3157244d17",
        "247240236966b3fa6ed2753288425b6c",
        "c81677bc9b7ac93b25027992b0261996",
        "c62fe109f75eedc3cc79395d84f9cf5d",
        "d1876c0f79c4300ab45594add66ff41f",
        "fde3bad205e5d0d73547964ef1fe37f1",
        "bd6e7c3df2b5779e0b61216e8b10b689"
    ],
    sbox:[
        "63cab7040953d051cd60e0e7ba70e18c",
        "a761ca9b97be8b45d8ad1a611fc97369",
        "3b59cb73fcd90ee05774222dc067fb68",
        "2dfb02343f6d12dd09337ec75b36e3f0",
        "36400926f9336d2d9fb59d23c42c3950",
        "e847f56514dadde23f77b64fe7f7d490",
        "b415f8016858552e4bb6124c5f998a4c",
        "3e175076b61c04678dfc2295f6a8bfc0",
        "5411f4b56bd9700e96a0902fa1bb9aa1",
        "7a9f102789d5f50b2beffd9f3dca4ea7"
    ],
    srow:[
       "6353e08c0960e104cd70b751bacad0e7",
       "a7be1a6997ad739bd8c9ca451f618b61", 
       "3bd92268fc74fb735767cbe0c0590e2d",
       "2d6d7ef03f33e334093602dd5bfb12c7", 
       "36339d50f9b539269f2c092dc4406d23",
       "e8dab6901477d4653ff7f5e2e747dd4f", 
       "b458124c68b68a014b99f82e5f15554c",
       "3e1c22c0b6fcbf768da85067f6170495", 
       "54d990a16ba09ab596bbf40ea111702f",
       "7ad5fda789ef4e272bca100b3d9ff59f" 
    ],
    mcol:[
        "5f72641557f5bc92f7be3b291db9f91a",
        "ff87968431d86a51645151fa773ad009",
        "4c9c1e66f771f0762c3f868e534df256",
        "6385b79ffc538df997be478e7547d691",
        "f4bcd45432e554d075f1d6c51dd03b3c",
        "9816ee7400f87f556b2c049c8e5ad036",
        "c57e1c159a9bd286f05f4be098c63439",
        "baa03de7a1f9b56ed5512cba5f414d23",
        "e9f74eec023020f61bf2ccf2353c21c7"
    ]

}

function prepareState(inputVal){
    let inputBlock = blocklib.parseBlock(inputVal);
    assert.equal(16, inputBlock.length, `input block '${inputBlock}' is wrong length`);
    let state = aes._loadState(inputBlock);
    return state;
}

function evaluateResult(state, expectedVal){
    let outputBlock = aes._readState(state, null);
    let actualValue = blocklib.blockToString(outputBlock);
    assert.equal(actualValue.toLowerCase(), expectedVal);
}

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
        let inputs = testInputs128.starts;
        let expected = testInputs128.sbox;
        for(let i = 0; i < expected.length; i++){
            let inputVal = inputs[i];
            let expectedVal = expected[i];
            it(`_subValues should return ${expectedVal} given ${inputVal}`, function(done){
                let state = prepareState(inputVal);
                aes.subValues(state);
                evaluateResult(state, expectedVal);
                done();
            })
        }
    });
    describe('test shiftrows function', function(){
        let inputs = testInputs128.sbox; 
        let expected = testInputs128.srow;
        for(let i = 0; i < expected.length; i++){
            let inputVal = inputs[i];
            let expectedVal = expected[i];
            it(`shiftRows should return ${expectedVal} given ${inputVal}`, function(done){
                let state = prepareState(inputVal);
                aes.subValues(state);
                evaluateResult(state, expectedVal);
                done();
            })
        }
    });
    describe('test mix columns function', function(){
        let inputs = testInputs128.srow; 
        let expected = testInputs128.mcol;
        for(let i = 0; i < expected.length; i++){
            let inputVal = inputs[i];
            let expectedVal = expected[i];
            it(`mixColumns should return ${expectedVal} given ${inputVal}`, function(done){
                let state = prepareState(inputVal);
                aes.subValues(state);
                evaluateResult(state, expectedVal);
                done();
            })
        }
    });


});


    /*  Test data from superceded fips.  128 bit
    More test data is here: 
    https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/AES_Core_All.pdf

input: cipher input
start: state at start of round[r]
s_box: state after SubBytes()
s_row: state after ShiftRows()
m_col: state after MixColumns()
k_sch: key schedule value for round[r]
output: cipher output 

round[ 0].input 00112233445566778899aabbccddeeff
round[ 0].k_sch 000102030405060708090a0b0c0d0e0f

round[ 1].start 00102030405060708090a0b0c0d0e0f0
round[ 1].s_box 63cab7040953d051cd60e0e7ba70e18c
round[ 1].s_row 6353e08c0960e104cd70b751bacad0e7
round[ 1].m_col 5f72641557f5bc92f7be3b291db9f91a
round[ 1].k_sch d6aa74fdd2af72fadaa678f1d6ab76fe

round[ 2].start 89d810e8855ace682d1843d8cb128fe4
round[ 2].s_box a761ca9b97be8b45d8ad1a611fc97369
round[ 2].s_row a7be1a6997ad739bd8c9ca451f618b61
round[ 2].m_col ff87968431d86a51645151fa773ad009
round[ 2].k_sch b692cf0b643dbdf1be9bc5006830b3fe

round[ 3].start 4915598f55e5d7a0daca94fa1f0a63f7
round[ 3].s_box 3b59cb73fcd90ee05774222dc067fb68
round[ 3].s_row 3bd92268fc74fb735767cbe0c0590e2d
round[ 3].m_col 4c9c1e66f771f0762c3f868e534df256
round[ 3].k_sch b6ff744ed2c2c9bf6c590cbf0469bf41

round[ 4].start fa636a2825b339c940668a3157244d17
round[ 4].s_box 2dfb02343f6d12dd09337ec75b36e3f0
round[ 4].s_row 2d6d7ef03f33e334093602dd5bfb12c7
round[ 4].m_col 6385b79ffc538df997be478e7547d691
round[ 4].k_sch 47f7f7bc95353e03f96c32bcfd058dfd

round[ 5].start 247240236966b3fa6ed2753288425b6c
round[ 5].s_box 36400926f9336d2d9fb59d23c42c3950
round[ 5].s_row 36339d50f9b539269f2c092dc4406d23
round[ 5].m_col f4bcd45432e554d075f1d6c51dd03b3c
round[ 5].k_sch 3caaa3e8a99f9deb50f3af57adf622aa

round[ 6].start c81677bc9b7ac93b25027992b0261996
round[ 6].s_box e847f56514dadde23f77b64fe7f7d490
round[ 6].s_row e8dab6901477d4653ff7f5e2e747dd4f
round[ 6].m_col 9816ee7400f87f556b2c049c8e5ad036
round[ 6].k_sch 5e390f7df7a69296a7553dc10aa31f6b

round[ 7].start c62fe109f75eedc3cc79395d84f9cf5d
round[ 7].s_box b415f8016858552e4bb6124c5f998a4c
round[ 7].s_row b458124c68b68a014b99f82e5f15554c
round[ 7].m_col c57e1c159a9bd286f05f4be098c63439
round[ 7].k_sch 14f9701ae35fe28c440adf4d4ea9c026

round[ 8].start d1876c0f79c4300ab45594add66ff41f
round[ 8].s_box 3e175076b61c04678dfc2295f6a8bfc0
round[ 8].s_row 3e1c22c0b6fcbf768da85067f6170495
round[ 8].m_col baa03de7a1f9b56ed5512cba5f414d23
round[ 8].k_sch 47438735a41c65b9e016baf4aebf7ad2

round[ 9].start fde3bad205e5d0d73547964ef1fe37f1
round[ 9].s_box 5411f4b56bd9700e96a0902fa1bb9aa1
round[ 9].s_row 54d990a16ba09ab596bbf40ea111702f
round[ 9].m_col e9f74eec023020f61bf2ccf2353c21c7
round[ 9].k_sch 549932d1f08557681093ed9cbe2c974e

round[10].start bd6e7c3df2b5779e0b61216e8b10b689
round[10].s_box 7a9f102789d5f50b2beffd9f3dca4ea7
round[10].s_row 7ad5fda789ef4e272bca100b3d9ff59f
round[10].k_sch 13111d7fe3944a17f307a78b4d2b30c5
round[10].output 69c4e0d86a7b0430d8cdb78070b4c55a 
    */