$(document).ready(function () {
    console.log("Hello");
    var link = "http://192.168.43.245:6060/getPost"/* API Call - DATA IN JSON; */;

    // var yo = [
    //     {
    //         "id": " ",
    //         "imageURL": "",
    //         "profileDescription": {
    //             "profilePicURL": "member_icon.png",
    //             "profileName": "Devarsh",
    //         },
    //         "upVoteCount": 15,
    //         "post": {
    //             "postHead": "Yo, Devarsh Loves Scam",
    //             "postContent": "Everyone thinks Devarsh is a scammer",
    //         },
    //     },
    //     {
    //         "id": " ",
    //         "imageURL": "",
    //         "profileDescription": {
    //             "profilePicURL": "member_icon.png",
    //             "profileName": "Meet",
    //         },
    //         "upVoteCount": 55,
    //         "post": {
    //             "postHead": "Yo, Devarsh Loves Scam",
    //             "postContent": "Everyone thinks Devarsh is a scammer",
    //         },
    //     },
    // ]
    // $.each(yo, function (index, value) {
    //     var appendContent = "";
    //     appendContent += "<div class=\"tile\">";
    //     if(value.imageURL != "") {
    //         appendContent += '<img src="' + value.imageURL + ' ">';
    //     }
    //     appendContent += '<div id="heading"><img src=" ' + value.profileDescription.profilePicURL +' "><span id="heading-name">' + value.profileDescription.profileName + '</span><span id="heading-upvote-count">' + value.upVoteCount + '</span><span id="heading-upvote"><i class="fas fa-thumbs-up"></i></span></div><p id="des-head">' + value.post.postHead + '</p><p id="des-content">' + value.post.postContent + '</p>';
    //     $('#posts').append('' + appendContent);
    // });

    $.getJSON(link, function (yo) {
        // YO should be Array of Posts
        console.log(yo)
        $.each(yo['data'], function (index, value) {
            // $('#posts').append('<div class="tile">');
            var appendContent = "";
            appendContent += "<div class=\"tile\">";
            if (value.imageURL) {
                appendContent += '<img src="' + value.imageURL + ' ">';
            }
            appendContent += '<div id="heading"><img src="./images/member_icon.png"><span id="heading-name">' + value.profileName + '</span><span id="heading-upvote-count">' + value.upVoteCount + '</span><span id="heading-upvote"><i class="fas fa-thumbs-up"></i></span></div><p id="des-head">' + value.heading + '</p><p id="des-content">' + value.message + '</p>';
            $('#posts').append('' + appendContent);
        });
    });
});