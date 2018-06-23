$(document).ready(function () {

    let btn_clicked = null;

    $('body').on('click', '.create-account', function(e) {

        btn_clicked = $(this);
        let id = $(this).parent().parent().parent().parent().find('input:hidden').attr('value');
        btn_clicked.attr("disabled", true);

        $.ajax({
            type: "POST",
            url: "/create-account",
            data: {id: id},
            success: function (data) {
                btn_clicked.attr("disabled", false);
                if(data.success) {

                    btn_clicked.parent().parent().parent().parent().remove();

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
                } else {
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
            },
            error: function (data) {
                btn_clicked.attr("disabled", false);
                console.log(data);
                $.notify({
                    icon: "nc-icon nc-fav-remove",
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
        });
    })
});