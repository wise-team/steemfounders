$(document).ready(function () {

    let btn_clicked = null;
    let accept = null;
    let post_id = null;

    $('body').on('click', '.btn-func-reject', function(e) {
        btn_clicked = $(this);
        post_id = $(this).parent().parent().parent().parent().find('input:hidden').attr('value');
        $('#rejectModal').modal();
    });

    $('body').on('click', '#btn-reject', function(e) {
        let reason = $('#reason').val();
        accept = $(this);
        accept.attr("disabled", true);
        $.ajax({
            type: "POST",
            url: "/reject",
            data: {id: post_id, reason: reason},
            success: function (data) {
                accept.attr("disabled", false);
                $('#rejectModal').modal('hide');
                if(data.success) {
                    btn_clicked.parent().parent().parent().parent().remove();
                    showSuccess(data);
                } else {
                    showError(data);
                }
            },
            error: function (data) {
                $('#rejectModal').modal('hide');
                accept.attr("disabled", false);
                console.log(data);
                showError(data);
            }
        });        
    });

    $('body').on('click', '.create-account', function(e) {
        btn_clicked = $(this);
        post_id = $(this).parent().parent().parent().parent().find('input:hidden').attr('value');
        $('#createAccountModal').modal();
    })

    $('body').on('click', '.hide-entry', function(e) {
        btn_clicked = $(this);
        post_id = $(this).parent().parent().parent().parent().find('input:hidden').attr('value');
        $('#hideEntryModal').modal();
    })

    $('body').on('click', '#btn-create', function(e) {
     
        accept = $(this);
        accept.attr("disabled", true);

        $.ajax({
            type: "POST",
            url: "/create-account",
            data: {id: post_id},
            success: function (data) {
                $('#createAccountModal').modal('hide');
                accept.attr("disabled", false);
                if(data.success) {
                    btn_clicked.parent().parent().parent().parent().remove();
                    showSuccess(data);
                } else {
                    showError(data);
                }
            },
            error: function (data) {
                $('#createAccountModal').modal('hide');
                accept.attr("disabled", false);
                console.log(data);
                showError(data);
            }
        });
    })

    $('body').on('click', '#btn-hide', function(e) {
     
        accept = $(this);
        accept.attr("disabled", true);

        $.ajax({
            type: "POST",
            url: "/hide",
            data: {id: post_id},
            success: function (data) {
                $('#hideEntryModal').modal('hide');
                accept.attr("disabled", false);
                if(data.success) {
                    btn_clicked.parent().parent().parent().parent().remove();
                    showSuccess(data);
                } else {
                    showError(data);
                }
            },
            error: function (data) {
                $('#hideEntryModal').modal('hide');
                accept.attr("disabled", false);
                console.log(data);
                showError(data);
            }
        });
    })
});

function showError(data) {
    $.notify({
        icon: "glyphicon glyphicon-remove",
        message: data.error          
    }, {
        type: 'danger',
        timer: 8000,
        spacing: 15,
        placement: {
            from: 'top',
            align: 'right'
        }
    });
}
function showSuccess(data) {
    $.notify({
        icon: "glyphicon glyphicon-ok",
        message: data.success          
    }, {
        type: 'success',
        timer: 8000,
        spacing: 15,
        placement: {
            from: 'top',
            align: 'right'
        }
    });
}