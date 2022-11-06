const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const context = createContext('secp256k1')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')

var signer;
function getprivatekey() {
    return context.newRandomPrivateKey();
}

function privateKeyFromhex(hex) {
    return Secp256k1PrivateKey.from_hex(hex)
}

function init(privateKey) {
    signer = new CryptoFactory(context).newSigner(privateKey)
    return signer;
}

function getPublickey(signer) {
    return signer.getPublicKey().asHex();
}

function gettransactionHeaderBytes(payloadBytes, tokey, signer) {
    var out = protobuf.TransactionHeader.encode({
        familyName: 'naturecommunity',
        familyVersion: '1.0',
        inputs: [tokey],
        outputs: [tokey],
        signerPublicKey: signer.getPublicKey().asHex(),
        batcherPublicKey: signer.getPublicKey().asHex(),
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish()
    return out
}

function getsignature(signer, transactionHeaderBytes) {
    return signer.sign(transactionHeaderBytes)
}

function gettransaction(signature, transactionHeaderBytes, payloadBytes) {
    let transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signature,
        payload: payloadBytes
    })
    return transaction;
}

function getbatchheaderbytes(signer, transactions) {
    var lol = protobuf.BatchHeader.encode({
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: transactions.map((txn) => txn.headerSignature),
    }).finish()
    return lol;
}

function getbatchlist(batchHeaderBytes, signaturex, transactions) {
    let batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: signaturex,
        transactions: transactions
    })
    let batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish()
    return batchListBytes
}

function sendbatch(batchListBytes) {
    request.post({
        url: 'http://192.168.43.245:6060/batches',
        body: batchListBytes,
        headers: { 'Content-Type': 'application/octet-stream' }
    }, (err, response) => {
        if (err) return console.log(err)
        console.log(response.body)
    })
}

module.exports = {
    getprivatekey: getprivatekey,
    init: init,
    getbatchheaderbytes, getbatchheaderbytes,
    getbatchlist: getbatchlist,
    getPublickey: getPublickey,
    gettransactionHeaderBytes: gettransactionHeaderBytes,
    sendbatch: sendbatch,
    getsignature: getsignature,
    gettransaction: gettransaction,
    privateKeyFromhex: privateKeyFromhex
}