(function () {
    // A (possibly faster) way to get the current timestamp as an integer. (taken from Underscorejs)
    function now() {
        return (
            Date.now ||
            function () {
                return new Date().getTime();
            }
        );
    }

    // it delays the execution of a function (taken from Underscorejs)
    function debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            var last = now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;

                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = now();
            var callNow = immediate && !timeout;

            if (!timeout) {
                timeout = setTimeout(later, wait);
            }

            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    // throttle function
    var throttle = function (func, wait, options) {
        var context,
            args,
            result,
            timeout = null,
            previous = 0;

        if (!options) {
            options = {};
        }

        var later = function () {
            previous = options.leading === false ? 0 : new Date().getTime();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };

        return function () {
            var now = new Date().getTime();

            if (!previous && options.leading === false) {
                previous = now;
            }

            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);

                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    var Site = function () {
        var $window = $(window),
            $body = $("body"),
            timer,
            event;

        // Debounce functions
        var scrollWindow = debounce(scrollControl, 250),
            scrollThrottle = throttle(scrollThrottle, 100),
            resizeWindow = debounce(resizeControl, 250);

        function scrollControl() { }

        function resizeControl() { }

        function scrollThrottle() {
            // window.dispatchEvent(new Event('mousemove'));
            movebg();
        }

        function movebg() {
            if ($window.width() > 800) {
                $('#about .bg img').each(function () {
                    
                    var $elem = $(this),
                        ratio = $elem.offset().top - $window.scrollTop(),
                        scale = parseFloat($elem.data('scale')),
                        // offsetX = ((event.clientX - ($window.width() / 2)) / $window.width()) * 2,
                        dy = ratio * $elem.data('depth') + ($elem.data('offset') * $window.height());
                        // dx = Math.floor($window.width() * ((scale - 1) * 0.9) / 2 * offsetX);
    
                    // $elem.css('transform', 'scale(' + scale + ') translate(' + dx + 'px, ' + dy + 'px)');
                    $elem.css('transform', 'scale(' + scale + ') translateY(' + dy + 'px)');
                });
            }
        }

        function populateCarousel($images, idx) {
            $images.each(function () {
                var $e = $(this);
                $('.carousel').slick('slickAdd', '<div data-caption="' + $e.data('caption') + '"><img src="' + $e.attr('src') + '"></div>');
            });

            $('.carousel').slick('slickGoTo', idx, true);
            $('.count .total').text($images.length);
            $('.count .curr').text(idx + 1);
        }

        function init() {
            bindUI();
        }

        function bindUI() {
            $('.btn-subscribe').on('click', function (e) {
                e.preventDefault();
                var $elem = $(this);
                if (!$elem.hasClass('open')) {
                    $elem.addClass('open');
                    $('#email').focus();
                }
            });

            $('.btn-subscribe .inner').on('click', function () {
                var $elem = $(this),
                    $btn = $elem.closest('.btn-subscribe');
                
                if ($btn.hasClass('open')) {
                    var $form = $elem.closest('form');
                    if ($('#email')[0].checkValidity()) {
                        $btn.find('.outer').removeClass('error');
                        
                        $.ajax({
                            type: 'get',
                            url: $form.attr('action'),
                            data: $form.serialize(),
                            cache: false,
                            dataType: 'jsonp',
                            jsonp: 'c',
                            contentType: "application/json; charset=utf8",
                            error: function (err) {
                                console.log('something went wrong :(');
                                console.log(err);
                            },
                            success: function (data) {
                                if (data.result == 'success') {
                                    // console.log('success!');
                                    $form.before('<p class="ty" style="font-size:15px;font-weight:500;color:#181137;letter-spacing:0.42;position:relative;top:2rem;display:none;">Thanks! we&rsquo;ve sent you a confirmation email.</p>');
                                    $('.ty').slideDown();
                                    setTimeout(function () {
                                        $('.ty').slideUp('slow');
                                    }, 7000);
                                } else {
                                    if (data.msg.indexOf('already subscribed') != -1) {
                                        $form.before('<p class="ty" style="font-size:15px;font-weight:500;color:#181137;letter-spacing:0.42;position:relative;top:2rem;display:none;">Thanks! But it looks like you&rsquo;ve already subscribed.</p>');
                                        $('.ty').slideDown();
                                        setTimeout(function () {
                                            $('.ty').slideUp('slow');
                                        }, 7000);
                                    }
                                }
                            }
                        });
                    } else {
                        $('#email').focus();
                        $btn.find('.outer').addClass('error');
                    }
                }
            })
            
            $('.btn-footer-subs').on('click', function (e) {
                e.preventDefault();
                $('html,body').animate({ scrollTop: $('.subscribe').offset().top + 'px' }, 'slow');
                setTimeout(function () {
                    $('.btn-subscribe').trigger('click');
                    // $('#email').focus();
                }, 1000);
            });

            $('#email').on('blur', function () {
                if ($(this).val() == '') {
                    timer = setTimeout(() => $('.btn-subscribe').removeClass('open'), 2000);
                }
            }).on('keydown', function () {
                clearTimeout(timer);
            });

            $('#mc-embedded-subscribe-form').on('submit', function (e) {
                e.preventDefault();
                $(this).find('.inner').trigger('click');
            });

            $('.swap-trigger').on('click', function (e) {
                e.preventDefault();
                $('.grid').toggleClass('alt');
            });

            $('.grid').on('swipeleft', function (e) {
                if ($window.width() <= 640) {
                    $(this).addClass('alt');
                }
            }).on('swiperight', function (e) {
                if ($window.width() <= 640) {
                    $(this).removeClass('alt');
                }
            });

            $('.btn-seemore').on('click', function (e) {
                e.preventDefault();
                $('.gallery').each(function () {
                    $(this).find('[hidden]').each(function (i) {
                        var $elem = $(this);
                        setTimeout(function () {
                            $elem.removeAttr('hidden');
                        }, 300 * i);
                    });
                });

                $(this).hide();
            });

            $('.nav-toggle').on('click', function (e) {
                e.preventDefault();
                $body.addClass('nav-open');
            });

            $('.mnav .close').on('click', function (e) {
                e.preventDefault();
                $body.removeClass('nav-open');
            });

            $('.mnav ul a').on('click', function (e) {
                e.preventDefault();
                $body.removeClass('nav-open');

                var target = $(this).attr('href');
                
                switch (target) {
                    case '#loom':
                    case '#brine':
                        offset = $(target).offset().top - 140;
                        break;
                    case '#gallery':
                        offset = $('.gallery').offset().top - 30;
                        break;
                    default:
                        offset = $(target).offset().top;
                }

                $('html, body').animate({ 'scrollTop': offset + 'px' }, 'slow', function () {
                    if (target == '#brine') $('#split .grid').addClass('alt');
                    if (target == '#loom') $('#split .grid').removeClass('alt');
                });
            });

            $('.gallery a').on('click', function (e) {
                e.preventDefault();
                var idx = $(this).index(),
                    side = $(this).closest('.col').attr('id'),
                    $imgs = $(this).closest('.gallery').find('img');
                
                $('.carousel').slick('slickRemove', null, null, true);
                $('.caption p, .caption .curr, .caption .total').text('');
                
                $('.lightbox .sides .active').removeClass('active');
                $('.lightbox .sides a[href="#' + side + '"]').addClass('active');
                    
                populateCarousel($imgs, idx);
                $body.addClass('lightbox-open');
            });

            $('.carousel').on('beforeChange', function () {
                $('.caption p').addClass('hidden');
            }).on('afterChange', function (event, slick, curr) {
                $('.caption p').html($('.carousel .slick-current').data('caption')).removeClass('hidden');
                $('.count .curr').text(curr + 1);
            });

            $('.lightbox .close').on('click', function (e) {
                e.preventDefault();
                $body.removeClass('lightbox-open');
            });

            $('.lightbox .side').on('click', function (e) {
                e.preventDefault();

                if (!$(this).hasClass('active')) {
                    var side = $(this).attr('href');

                    $('.carousel .slick-list').addClass('hidden');
                    $(this).addClass('active').siblings().removeClass('active');
                    
                    setTimeout(function () {
                        $('.carousel').slick('slickRemove', null, null, true);
                        $('.caption p, .caption .curr, .caption .total').text('');
                        
                        var $imgs = $(side).find('.gallery img');
                        
                        populateCarousel($imgs, 0);
                        
                    }, 300);
                    
                    setTimeout(function () {
                        $('.carousel .slick-list').removeClass('hidden');
                    }, 500);
                }
            });

            $window.on("load", function () {
                scrollThrottle();

                var higher = 0;
                $('.grid .content').each(function () {
                    if ($(this).height() > higher) higher = $(this).height();
                });
                $('.grid .content').css('height', higher);

                $('.carousel').slick({
                    // appendArrows    : $('.carousel-nav'),
                    prevArrow       : '<a href="#" class="prev"></a>',
                    nextArrow       : '<a href="#" class="next"></a>'
                });

                var mh = Math.round($('.gallery:first img:first').height());
                $('.gallery a').css('max-height', mh + 'px');
            });

            // $window.on("mousemove", function (e) {
            //     event = e;
            //     movebg();
            // });

            // scroll control
            $window.on("scroll", function () {
                scrollWindow();
                scrollThrottle();
            });

            // resize control
            $window.on("resize", function () {
                resizeWindow();
            });

            $window.trigger("hashchange");
        }

        return { init: init };
    };

    var site = new Site();
    site.init();
})(jQuery);
