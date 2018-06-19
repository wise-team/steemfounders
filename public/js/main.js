$(document).ready(function () {

    var specificField = $('#account').parsley();

    $.event.special.inputchange = {
        setup: function() {
            var self = this, val;
            $.data(this, 'timer', window.setInterval(function() {
                val = self.value;
                if ( $.data( self, 'cache') != val ) {
                    $.data( self, 'cache', val );
                    $( self ).trigger( 'inputchange' );
                }
            },500));
        },
        teardown: function() {
            window.clearInterval( $.data(this, 'timer') );
        },
        add: function() {
            $.data(this, 'cache', this.value);
        }
    };
    
    $('#account').on('inputchange', function() {
        console.log(this.value);

        $.ajax({
                type: "POST",
                url: "/check",
                data: {"account": this.value},
                success: function (data) {
                    console.log(data);
                    window.ParsleyUI.removeError(specificField, "myCustomError");
                    if(data.success) {
                    } else {
                        window.ParsleyUI.addError(specificField, "myCustomError", data.error);
                    }
                },
                error: function (data) {
                    console.log(data);
                }
            });
    });

    $('body').on('click', '#resend', function(e) {

        $.ajax({
            type: "POST",
            url: "/resend",
            data: {"email": $('#new-mail').val()},
            success: function (data) {
                if(data.success) {
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

    let inProgress = false;

    $('#rf').parsley();

    $('#rf').submit(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/check",
            data: {"account": $('#account').val()},
            success: function (data) {
                console.log(data);
                window.ParsleyUI.removeError(specificField, "myCustomError");
                if(data.success) {
                    $.ajax({
                        type: "POST",
                        url: "/finish",
                        data: $('#rf').serialize(),
                        success: function (data) {
                            $(location).attr('href', '/dashboard')
                        },
                        error: function (data) {
                            console.log(data);
                        }
                    });
                } else {
                    window.ParsleyUI.addError(specificField, "myCustomError", data.error);
                }
            },
            error: function (data) {
                console.log(data);
            }
        });
    });

    $('#register').submit(function (e) {
        e.preventDefault();
        if(!inProgress) {
            inProgress = true;

            var user = $(this).serialize();

            $.ajax({
                type: "POST",
                url: "/register",
                data: user,
                success: function (data) {
                    inProgress = false;
                    if (data.success) {
                        
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

                    } else if (data.error) {
                        inProgress = false;
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
                },
                error: function (data) {
                    inProgress = false;
                    $.notify({
                        icon: "nc-icon nc-fav-remove",
                        message: "Coś poszło nie tak..."        
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
        }
    });  
});