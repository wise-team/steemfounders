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
                if(data.success) {
                    $('#rejectModal').modal('hide');
                    btn_clicked.parent().parent().parent().parent().remove();
                    showSuccess(data);
                } else {
                    showError(data);
                }
            },
            error: function (data) {
                accept.attr("disabled", false);
                console.log(data);
                showError(data);
            }
        });        
    });

    

    $('body').on('click', '.create-account', function(e) {

        btn_clicked = $(this);
        post_id = $(this).parent().parent().parent().parent().find('input:hidden').attr('value');
        btn_clicked.attr("disabled", true);

        $.ajax({
            type: "POST",
            url: "/create-account",
            data: {id: post_id},
            success: function (data) {
                btn_clicked.attr("disabled", false);
                if(data.success) {
                    btn_clicked.parent().parent().parent().parent().remove();
                    showSuccess(data);
                } else {
                    showError(data);
                }
            },
            error: function (data) {
                btn_clicked.attr("disabled", false);
                console.log(data);
                showError(data);
            }
        });
    })
});

function showError(data) {
    $.notify({
        icon: "nc-icon nc-send",
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
        icon: "nc-icon nc-send",
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