"use strict";

$(document).ready(function() {
    function handleError (message) {
        alert(message);
    }

    function sendAjax (action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
                window.location = result.redirect;
            },
            error: function (xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);

                handleError(messageObj.error);
            }
        });
    }

    $("#makeShipSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#shipName").val() == '' || $("#shipBullet").val() == '') {
            handleError("All fields are required");
            return false;
        }

        sendAjax($("#shipForm").attr("action"), $("#shipForm").serialize());

        return false;
    });

    $(".shipRemoveForm").on("click", function (e) {
    debugger;
        e.preventDefault();

        var target = $(this);
        var attr = target.attr("action");

        sendAjax(attr, target.serialize());

        return false;
    });
});