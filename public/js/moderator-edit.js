$(document).ready(function () {

    let id = $('#_id').val();
    var simplemde = new SimpleMDE(
        {
            autosave: {
                enabled: true, 
                uniqueId: id ? id : "steemfoundersnewpost", 
                delay: 1000
            },
            shortcuts: {
                "toggleOrderedList": "Ctrl-J", // alter the shortcut for toggleOrderedList
                "toggleCodeBlock": null, // bind to Ctrl-Shift-C
                "drawTable": null // bind Cmd-Alt-T to drawTable action, which doesn't come with a default shortcut
            },
            forceSync: true, 
            spellChecker: false,
            element: document.getElementById("post-body"),
            showIcons: ["code", "table"],
          
        });

    $('#post').submit(function (e) {
        e.preventDefault();
        $('#submit').attr("disabled", true);
        $.ajax({
            type: "POST",
            url: "/publish",
            data: $(this).serialize(),
            success: function (data) {
                console.log(data);;
                if(data.success) {
                    showNotification('success', data.success);
                    setTimeout(function() {
                        $(location).attr('href', '/dashboard');
                    },2000);
                } else {
                    showNotification('danger', data.error);
                    $('#submit').attr("disabled", false)
                }
            },
            error: function (data) {
                showNotification('danger', data.error);
                $('#submit').attr("disabled", false)
            }
        });
    });

    function showNotification(type, message) {
        $.notify({
            icon: "nc-icon nc-fav-remove",
            message: message          
        }, {
            type: type,
            timer: 8000,
            spacing: 15,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    }

});