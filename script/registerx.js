const sawtooth = require('./sawtooth.js')
$(document).ready(function () {
    console.log("Hello");
    var image = $('#uploadImage').attr('src');
    $('#uploadImage').click(function () {
        // Dwij Native Photo Api Call
        console.log("Hello Image");
        image = "Avtar2.png";
        $("#uploadImage").attr("src", image);
    });
    $('#submit').click(function () {
        var name = $('#name').val();
        var email = $('#email').val();
        var password = $('#password').val();
        var phone = $('#phone').val();
        // console.log("Name: " + name);
        // console.log("Email: " + email);
        // console.log("Password: " + password);
        // console.log("Phone: " + phone);
        var privatekey = sawtooth.getprivatekey();
        var signer = sawtooth.init(privatekey)
        var publicKey = sawtooth.getPublickey(signer);
        var yo = {
            "publicKey": publicKey,
            "profilePicURL": image,
            "name": name,
            "email": email,
            "password": password,
            "phone": phone,
        }

        // $.post("http://192.168.43.245:6060/register", yo)
        //     .done(function( data ) {
        //         alert( "Data Loaded: " + data );
        // });
        $.ajax({
            type: 'POST',
            url: "http://192.168.43.245:6060/register",
            data: JSON.stringify(yo),
            success: function (result) {
                window.localStorage.setItem("email", email)
                let pk = sawtooth.privatekeyhex(privatekey)
                window.localStorage.setItem("privatekey", pk)
                var pl = { action: "register", data: yo }
                var payload = sawtooth.Base64.encode(JSON.stringify(pl))
                var encoder = new TextEncoder();
                var payloadbyte = encoder.encode(payload);
                var tokey = sawtooth.getwalletaddr(publicKey)
                var trhb = sawtooth.gettransactionHeaderBytes(payloadbyte, tokey, signer)
                var sig1 = sawtooth.getsignature(signer, trhb)
                var trn = sawtooth.gettransaction(sig1, trhb, payloadbyte)
                var transactions = [trn]
                var bhb = sawtooth.getbatchheaderbytes(signer, transactions)
                var sig2 = sawtooth.getsignature(signer, bhb)
                var batch = sawtooth.getbatchlist(bhb, sig2, transactions)
                sawtooth.sendbatch(batch)
                window.location.href = 'home.html';

            }
        });

        // console.log(yo);
    });
});