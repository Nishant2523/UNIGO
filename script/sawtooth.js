const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const context = createContext('secp256k1')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
const request = require('request')

var signer;
function getprivatekey() {
    return context.newRandomPrivateKey();
}

function privateKeyFromhex(hex) {
    return Secp256k1PrivateKey.fromHex(hex)
}

function privatekeyhex(privateKey) {
    return privateKey.asHex()
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

function hash_(payload) {
    return createHash('sha512').update(payload).digest('hex')
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

function getwalletaddr(x) {
    return createHash('sha512').update("naturecommunity").digest('hex').toLowerCase().substring(0, 6) + createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)
}

function getpostaddr(timestamp, nounce, publickey) {
    return createHash('sha512').update("naturecommunity").digest('hex').toLowerCase().substring(0, 6) + createHash('sha512').update(timestamp).digest('hex').toLowerCase().substring(0, 9) + createHash('sha512').update(publickey).digest('hex').toLowerCase().substring(0, 50) + createHash('sha512').update(nounce).digest('hex').toLowerCase().substring(0, 5)
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
    privateKeyFromhex: privateKeyFromhex,
    privatekeyhex: privatekeyhex,
    Base64: Base64,
    hash_: hash_,
    getwalletaddr: getwalletaddr,
    getpostaddr: getpostaddr
}