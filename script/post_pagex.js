const sawtooth = require("./sawtooth")
var imageURL = $('#newPic').attr('src');

function PreviewImage() {

};

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

$(document).ready(function () {
    $('#uploadImage').change(function () {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);

        oFReader.onload = function (oFREvent) {
            document.getElementById("newPic").src = oFREvent.target.result;
            $('#newPic').show();
            $('#hideAfterPic').hide();
            imageURL = $('#newPic').attr('src');
        };
    })
    $('#post').click(function () {
        var heading = $('#heading').val();
        var message = $('#message').val();

        var nounce = makeid(10)
        var name = localStorage.email; // JSON points to username
        name = name.split("@");
        name = name[0];
        var yo = {
            "heading": heading,
            "message": message,
            "imageURL": imageURL,
            "profilePicURL": "",
            "profileName": name,
            "timestamp": "654646456546",
            "nounce": nounce,
            "geo": "",
            "upVoteCount": "0"
        }



        console.log(yo);

        var pk = localStorage.getItem("privatekey")
        var privatekey = sawtooth.privateKeyFromhex(pk)
        var signer = sawtooth.init(privatekey)
        var publickey = sawtooth.getPublickey(signer)
        var pl = { action: "post", data: yo }
        var payload = sawtooth.Base64.encode(JSON.stringify(pl))
        var encoder = new TextEncoder();
        var payloadbyte = encoder.encode(payload);
        var tokey = sawtooth.getpostaddr("654646456546", nounce, publickey)
        var trhb = sawtooth.gettransactionHeaderBytes(payloadbyte, tokey, signer)
        var sig1 = sawtooth.getsignature(signer, trhb)
        var trn = sawtooth.gettransaction(sig1, trhb, payloadbyte)
        var transactions = [trn]
        var bhb = sawtooth.getbatchheaderbytes(signer, transactions)
        var sig2 = sawtooth.getsignature(signer, bhb)
        var batch = sawtooth.getbatchlist(bhb, sig2, transactions)
        sawtooth.sendbatch(batch)
        window.location.href = 'home.html';

    });
});