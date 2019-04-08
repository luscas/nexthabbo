/**
 * NextHabbo
 *
 * Henrique Arthur <eu@henriquearthur.com.br>
 */

Master = {
    plugins: {
        ellipsis: function() {
            el = (typeof el === 'undefined') ? false : el;

            if (!el) {
                $('.ell').ellipsis();
            } else {
                // Makes it faster
                el.find('.ell').ellipsis();
            }
        },
        tooltip: function() {
            $('[title]').tooltip();
        },
        vis: (function() {
            var stateKey, eventKey, keys = {
                hidden: "visibilitychange",
                webkitHidden: "webkitvisibilitychange",
                mozHidden: "mozvisibilitychange",
                msHidden: "msvisibilitychange"
            };

            for (stateKey in keys) {
                if (stateKey in document) {
                    eventKey = keys[stateKey];
                    break;
                }
            }

            return function(c) {
                if (c) document.addEventListener(eventKey, c);

                return !document[stateKey];
            };
        })(),
        init: function() {
            Master.plugins.ellipsis();
            Master.plugins.tooltip();
        }
    },
    init: function() {
        Master.plugins.init();
    }
}

$(document).ready(function() {
    Master.init();
});

/**
 * NextHabbo
 *
 * Henrique Arthur <eu@henriquearthur.com.br>
 */

Navigation = {
    plugins: function() {
        $('.navigation-menu').slick({
            dots: false,
            infinite: false,
            arrows: false,
            speed: 300,
            slidesToShow: 5.3,
            slidesToScroll: 1,
            responsive: [{
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3.1,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2.1,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1.1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    },
    loadPage: function(e) {
        var el = $(this);

        var link = el.attr('href');

        if (link == "#" || el.hasClass("no-event")) {
            e.preventDefault();
        } else if (el.attr("target") == "_blank") {
            window.open(link, "_blank");
        } else {
            e.preventDefault();

            window.history.pushState(null, '', link);

            $(".navigation-wrapper-effect").show();

            $(".navigation-effect-bar-1").animate({
                width: '100%'
            }, {
                duration: 400,
                complete: function() {
                    $(".navigation-effect-bar-2").animate({
                        width: '100%'
                    }, {
                        duration: 200,
                        complete: function() {
                            $(".navigation-wrapper-effect").fadeOut('fast', function() {
                                $(".navigation-effect-bar-1, .navigation-effect-bar-2").css({
                                    'width': '0'
                                });
                            });
                        }
                    });
                }
            });



            $.ajax({
                url: link + '?pageloader=1',
                type: 'GET',
                dataType: 'json'
            }).done(function(data) {
                document.title = "NextHabbo • " + data.title;

                $(".page-content").html(data.html);

                Navigation.plugins();
                Radio.volumeSlider();
            })
        }
    },
    init: function() {
        $(document).on('click', 'a', Navigation.loadPage);

        Navigation.plugins();
    }
}

$(document).ready(function() {
    Navigation.init();
});

/**
 * NextHabbo
 *
 * Henrique Arthur <eu@henriquearthur.com.br>
 */

Radio = {
    volumeSlider: function() {
        $(".player-volume-slider").slider({
            range: "min",
            min: 0,
            value: 0,
            slide: function(event, ui) {
                var value = $("#player-volume-slider").slider('value');

                //audio.volume = (value / 100);
            },
            stop: function(event, ui) {
                var value = $("#player-volume-slider").slider('value');

                //audio.volume = (value / 100);
            }
        });
    },
    control: function() {
        if ($(".radio-control").data('status') == 'playing') {
            $(".radio-control").data('status', 'paused').html('<i class="icn play x4"></i>').attr('title', 'Tocar a rádio').tooltip('hide');

            if (window.parent.playerFrame) {
                window.parent.playerFrame.pause();
            } else {
                document.getElementById("stream-site").pause();
            }

            Cookies.set('radio_player', 'paused');
        } else {
            if (window.parent.playerFrame) {
                window.parent.playerFrame.play();
            } else {
                var promise = document.getElementById("stream-site").play();

                if (promise !== undefined) {
                    promise.then(_ => {
                        console.log("[Stream-Site] Play successful");
                    }).catch(error => {
                        console.log("[Stream-Site] Play failed", error);
                    });
                }
            }

            $(".radio-control").data('status', 'playing').html('<i class="icn stop x4"></i>').attr('title', 'Pausar a rádio').tooltip('hide');
            Cookies.set('radio_player', 'playing');
        }
    },
    initSocket: function() {
        Sockets.socket.on("shoutcast-data", function(data) {
            $(".radio-info-avatar").css('background-image', 'url(' + data.broadcasterData.avatar + ');');
            $(".radio-info-broadcaster").text(data.broadcaster);
            $(".radio-info-program").text(data.program);
            $(".radio-info-listeners").text(data.listeners);
        });
    },
    init: function() {
        Radio.volumeSlider();

        if (!window.parent.playerFrame || localStorage.getItem('radio_play') == 'not_allowed' || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $(".radio-control").data('status', 'paused').html('<i class="icn play x4"></i>').attr('title', 'Tocar a rádio').tooltip('hide');
        }

        $(".radio-control").on('click', Radio.control);
    }
}

$(document).ready(function() {
    Radio.init();
});

$(window).on('connected-to-socket', function () {
    Radio.initSocket();
});

/**
 * NextHabbo
 *
 * Henrique Arthur <eu@henriquearthur.com.br>
 */

Sockets = {
    socket: false,
    init: function() {
        Sockets.socket = io.connect("http://" + Sockets.hostname + ":" + Sockets.port);

        Sockets.socket.on("connected-to-socket", function() {
            var evt = $.Event('connected-to-socket');
            $(window).trigger(evt);
        });
    }
};

$(document).ready(function() {
    // init must be on master template because of hostname and port variables
    // Sockets.init();
});

/**
 * NextHabbo
 *
 * Henrique Arthur <eu@henriquearthur.com.br>
 */

ViewTopic = {
    goTopic: function() {
        $("html, body").animate({
            scrollTop: $('.topic-entry').offset().top
        }, 1000);
    },
    goReply: function() {
        $("html, body").animate({
            scrollTop: $('.topic-first-reply').offset().top
        }, 1000);
    },
    init: function() {
        $(document).on('click', '.view-topic-go-topic', ViewTopic.goTopic);
        $(document).on('click', '.view-topic-go-reply', ViewTopic.goReply);
    }
}

$(document).ready(function() {
    ViewTopic.init();
});

//# sourceMappingURL=app.js.map
