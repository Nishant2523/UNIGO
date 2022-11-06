$(document).ready(function () {
    console.log("ready!");
    // var cookie = document.cookie;
    if (localStorage.email) {
        window.location.href = 'home.html'; // Home Page URL SET
    }
    //localStorage.setItem("email", "devarsh");
    $("#login").click(function () {
        $("#loader").show();
        //   	$.get( "http://ip-api.com/json/", function( data ) { // API CALL
        //   		$("#loader").hide();
        //   		var email = $('#email').val();
        //   		var password = $('#password').val();

        //   		console.log(JSON.stringify(data));
        //   		localStorage.setItem("email", email);
        //   		window.location.href = 'home.html'; // Home Page URL SET
        // });
        var email = $('#email').val();
        var password = $('#password').val();
        var yo = { email: email, password: password }
        $.ajax({
            type: 'POST',
            url: "http://192.168.43.245:6060/login",
            data: JSON.stringify(yo),
            success: function (result) {
                $("#loader").hide();
                console.log(result)
                localStorage.setItem("email", email);
                window.location.href = 'home.html'; // Home Page URL SET
            }
        });
    });
});