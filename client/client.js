"use strict";

$(document).ready(function() {
    var handleError = function (message) {
        alert(message);
    }

    var sendAjax = function (action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function(result, status, xhr) {
                window.location = result.redirect;
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);

                handleError(messageObj.error);
            }
        });
    }

    $("#signupSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#user").val() == '' ||
            $("#pass").val() == '' ||
            $("#pass2").val() == '') {

            handleError("All fields are required.");
            return false;
        }

        if($("#pass").val() !== $("#pass2").val()) {
            handleError("Passwords do not match.");
            return false;
        }

        sendAjax(
            $("#signupForm").attr("action"), $("#signupForm").serialize()
        );

        return false;
    });
    
    $("#signupForm").on("keypress", function (e) {
        if(e.keyCode == 13) {
            $("#signupSubmit").click();
        }
    });

    $("#loginSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#user").val() == '' ||
            $("#pass").val() == '') {

            handleError("Username and password required.");
            return false;
        }

        sendAjax(
            $("#loginForm").attr("action"), $("#loginForm").serialize()
        );

        return false;
    });
    
    $("#loginForm").on("keypress", function (e) {
        if(e.keyCode == 13) {
            $("#loginSubmit").click();
        }
    });
});