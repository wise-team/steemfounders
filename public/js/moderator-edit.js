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

});