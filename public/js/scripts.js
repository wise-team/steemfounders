(function ($) {
 "use strict";

	/*----------------------------
	 wow js active
	------------------------------ */
	 new WOW().init();
	/*------------- preloader js --------------*/
	$(window).on('load',function() { // makes sure the whole site is loaded
		$('.loader-container').fadeOut(); // will first fade out the loading animation
		$('.loader').delay(150).fadeOut('slow'); // will fade out the white DIV that covers the website.
		$('body').delay(150).css({'overflow':'visible'})
	})

    // slider-active
	 $('.slider-active').owlCarousel({
        margin:0,
		loop:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:true,
		smartSpeed:800,
        navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:1
            },
            768:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });

    // slider-active
	 $('.rtl-slider-active').owlCarousel({
        margin:0,
		loop:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:true,
		rtl:true,
		smartSpeed:800,
        navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:1
            },
            768:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });

    $('.particleground').particleground({
		dotColor: '#a1a1a1',
		lineColor: '#a1a1a1',
		particleRadius:5,
		lineWidth:1,
		curvedLines:true,
		proximity:100,
		parallaxMultiplier:50,
	});

	//slider-area background setting
    function sliderBgSetting() {
        if ($(".slider-area .slider-items").length) {
            $(".slider-area .slider-items").each(function() {
                var $this = $(this);
                var img = $this.find(".slider").attr("src");

                $this.css({
                    backgroundImage: "url("+ img +")",
                    backgroundSize: "cover",
                    backgroundPosition: "center center"
                })
            });
        }
    }
	/*==========================================================================
        WHEN DOCUMENT LOADING
    ==========================================================================*/
	$(window).on('load', function() {

		sliderBgSetting();

	});

    // Parallax background
    function bgParallax() {
        if ($(".parallax").length) {
            $(".parallax").each(function() {
                var height = $(this).position().top;
                var resize     = height - $(window).scrollTop();
                var parallaxSpeed = $(this).data("speed");
                var doParallax = -(resize / parallaxSpeed);
                var positionValue   = doParallax + "px";
                var img = $(this).data("bg-image");

                $(this).css({
                    backgroundImage: "url(" + img + ")",
                    backgroundPosition: "50%" + positionValue,
                    backgroundSize: "cover",
                });

                if ( window.innerWidth < 768) {
                    $(this).css({
                        backgroundPosition: "center center"
                    });
                }
            });
        }
    }
	$(window).on("scroll", function() {
		bgParallax();
	});


	// // stickey menu
	$(window).on('scroll',function() {
		var scroll = $(window).scrollTop(),
			mainHeader = $('#sticky-header'),
			mainHeaderHeight = mainHeader.innerHeight();

		// console.log(mainHeader.innerHeight());
		if (scroll > 1) {
			$("#sticky-header").addClass("sticky");
		}else{
			$("#sticky-header").removeClass("sticky");
		}
	});

	/*--------------------------
	 scrollUp
	---------------------------- */
	/* $.scrollUp({
		scrollText: '<i class="fa fa-arrow-up"></i>',
		easingType: 'linear',
		scrollSpeed: 900,
		animation: 'fade'
	}); */

	/*--
	Magnific Popup
	------------------------*/
	$('.popup').magnificPopup({
		type: 'image',
		gallery:{
			enabled:true
		}

	});

	/* magnificPopup video view */
	$('.video-popup').magnificPopup({
		type: 'iframe',
	});

	// counter up
	$('.counter').counterUp({
		delay: 10,
		time: 1000
	});


	// slicknav
	$('ul#navigation').slicknav({
		prependTo:".responsive-menu-wrap"
	});

    $('.grid').imagesLoaded( function() {

	// filter items on button click
	$('.portfolio-menu').on( 'click', 'button', function() {
	  var filterValue = $(this).attr('data-filter');
	  $grid.isotope({ filter: filterValue });
	});

	// init Isotope
	var $grid = $('.grid').isotope({
	  itemSelector: '.portfolio',
	  percentPosition: true,
	  masonry: {
		// use outer width of grid-sizer for columnWidth
		columnWidth: '.portfolio',
	  }
	});
	});

	$('.portfolio-menu button').on('click', function(event) {
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
		event.preventDefault();
	});

	/*-------------------------------------------------------
        blog details
    -----------------------------------------------------*/
    if ($(".about-page-area,.single-service-area").length) {
        var post = $(".about-page-images,.single-service-img");

        post.each(function() {
            var $this = $(this);
            var entryMedia = $this.find("img");
			var entryMediaPic = entryMedia.attr("src");

            $this.css({
                backgroundImage: "url("+ entryMediaPic +")",
                backgroundSize: "cover",
                backgroundPosition: "center center",
            })
        })
    }

    function setTwoColEqHeight($col1, $col2) {
        var firstCol = $col1,
            secondCol = $col2,
            firstColHeight = $col1.innerHeight(),
            secondColHeight = $col2.innerHeight();

        if (firstColHeight > secondColHeight) {
            secondCol.css({
                "height": firstColHeight + 1 + "px"
            })
        } else {
            firstCol.css({
                "height": secondColHeight + 1 + "px"
            })
        }
    }


	$(window).on("load", function() {
		setTwoColEqHeight($(".about-page-images,.single-service-img"), $(".about-info,.single-service-wrap"));

	});

    // brand-active
	 $('.brand-active').owlCarousel({
        margin:0,
		loop:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:false,
		smartSpeed:800,
        navText:['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:2
            },
            450:{
                items:2
            },
            768:{
                items:3
            },
            1000:{
                items:4
            }
        }
    });

    // test-active
	 $('.test-active').owlCarousel({
        margin:0,
		loop:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:true,
		smartSpeed:800,
        navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:1
            },
            768:{
                items:2
            },
            1000:{
                items:2
            }
        }
    });

    // case-active
     $('.case-active').owlCarousel({
        margin:0,
        loop:true,
        autoplay:true,
        autoplayTimeout:4000,
        nav:true,
        smartSpeed:800,
        navText:['<i class="fa fa-long-arrow-left"></i>','<i class="fa fa-long-arrow-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:2
            },
            768:{
                items:3
            },
            1000:{
                items:4
            }
        }
    });

    // rtl-brand-active
	 $('.rtl-brand-active').owlCarousel({
        margin:0,
		loop:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:false,
		rtl:true,
		smartSpeed:800,
        navText:['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:2
            },
            450:{
                items:2
            },
            768:{
                items:3
            },
            1000:{
                items:4
            }
        }
    });

    // rtl-test-active
	 $('.rtl-test-active').owlCarousel({
        margin:0,
		loop:true,
		rtl:true,
		autoplay:true,
		autoplayTimeout:4000,
        nav:true,
		smartSpeed:800,
        navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:1
            },
            768:{
                items:2
            },
            1000:{
                items:2
            }
        }
    });

    // rtl-case-active
     $('.rtl-case-active').owlCarousel({
        margin:0,
        loop:true,
        autoplay:true,
        autoplayTimeout:4000,
		rtl:true,
        nav:false,
        smartSpeed:800,
        navText:['<i class="fa fa-long-arrow-left"></i>','<i class="fa fa-long-arrow-right"></i>'],
        URLhashListener:true,
        startPosition: 'URLHash',
        responsive:{
            0:{
                items:1
            },
            450:{
                items:2
            },
            768:{
                items:3
            },
            1000:{
                items:4
            }
        }
    });
})(jQuery);
