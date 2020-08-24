// document.onreadystatechange = function() {
//     if (document.readyState === "interactive") {

//     }
// }
window.addEventListener('load', function() {
    let widthSlide = 120,
        heightSlide = 150;
    // rotating slider (jQuery)
    $.fn.rotatingSlider = function(options) {
        var rotatingSlider = {
            init: function(el) {
                this.$slider = $(el);
                this.$slidesContainer = this.$slider.children('ul.slides');
                this.$slides = this.$slidesContainer.children('li');
                this.$clipPath;
                this.$directionControls;
                this.settings = $.extend({ autoRotate: !0, autoRotateInterval: 6000, draggable: !0, directionControls: !0, directionLeftText: '&lsaquo;', directionRightText: '&rsaquo;', rotationSpeed: 750, slideHeight: 360, slideWidth: 480, meTopCoef: 0, meInnerRadiusCoef: 1.23, mePaddingCoef: 1 }, options);
                this.slideAngle = 360 / this.$slides.length;
                this.currentRotationAngle = 0;
                this.autoRotateIntervalId = !1;
                this.rotateTimoutId = !1;
                this.currentlyRotating = !1;
                this.readyToDrag = !1;
                this.dragStartPoint;
                this.dragStartAngle;
                this.currentlyDragging = !1;
                this.markupIsValid = !1;
                this.validateMarkup();
                if (this.markupIsValid) {
                    this.renderSlider();
                    this.bindEvents();
                    if (this.settings.autoRotate) {
                        this.startAutoRotate()
                    }
                }
            },
            bindEvents: function() {
                if (this.settings.draggable) {
                    this.$slidesContainer.on('mousedown touchstart', this.handleDragStart.bind(this));
                    this.$slidesContainer.on('mousemove touchmove', this.handleDragMove.bind(this));
                    this.$slidesContainer.on('mouseup mouseleave touchend', this.handleDragEnd.bind(this))
                }
                if (this.settings.directionControls) {
                    this.$slider.find('ul.direction-controls .left-arrow button').click(this.handleLeftDirectionClick.bind(this));
                    this.$slider.find('ul.direction-controls .right-arrow button').click(this.handleRightDirectionClick.bind(this))
                }
            },
            handleDragStart: function(e) {
                this.readyToDrag = !0;
                this.dragStartPoint = (e.type === 'mousedown') ? e.pageX : e.originalEvent.touches[0].pageX
            },
            handleDragMove: function(e) {
                if (this.readyToDrag) {

                    var pageX = (e.type === 'mousemove') ? e.pageX : e.originalEvent.touches[0].pageX;
                    if (this.currentlyDragging === !1 && this.currentlyRotating === !1 && (this.dragStartPoint - pageX > 10 || this.dragStartPoint - pageX < -10)) {
                        this.stopAutoRotate();
                        if (this.settings.directionControls) {
                            this.$directionControls.css('pointer-events', 'none');
                        }
                        window.getSelection().removeAllRanges();
                        this.currentlyDragging = !0;
                        this.dragStartAngle = this.currentRotationAngle
                    }
                    if (this.currentlyDragging) {

                        this.currentRotationAngle = this.dragStartAngle - ((this.dragStartPoint - pageX) / this.settings.slideWidth * this.slideAngle);
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + -this.currentRotationAngle + 'deg)')
                    }
                }
            },
            handleDragEnd: function(e) {


                this.readyToDrag = !1;
                if (this.currentlyDragging) {
                    this.currentlyDragging = !1;

                    this.currentRotationAngle = Math.round(this.currentRotationAngle / this.slideAngle) * this.slideAngle;
                    this.rotate();
                    if (this.settings.directionControls) {
                        this.$directionControls.css('pointer-events', '')
                    }
                }
            },
            handleLeftDirectionClick: function(e) {
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateClockwise()
            },
            handleRightDirectionClick: function(e) {
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateCounterClockwise()
            },
            renderSlider: function() {
                var halfAngleRadian = this.slideAngle / 2 * Math.PI / 180;
                var innerRadius = (1 / Math.tan(halfAngleRadian) * widthSlide / 2) * this.settings.meInnerRadiusCoef;
                var outerRadius = Math.sqrt(Math.pow(innerRadius + heightSlide, 2) + (Math.pow((widthSlide / 2), 2)));
                let upperArcHeight = outerRadius - (innerRadius + heightSlide);
                let lowerArcHeight = innerRadius - (innerRadius * (Math.cos(halfAngleRadian)));
                var slideFullWidth = (((Math.sin(halfAngleRadian) * outerRadius) * 2));
                var slideFullHeight = upperArcHeight + heightSlide + lowerArcHeight
                var slideSidePadding = (slideFullWidth - widthSlide) / 2;
                var fullArcHeight = outerRadius - (outerRadius * (Math.cos(halfAngleRadian)));
                var lowerArcOffset = (slideFullWidth - (Math.sin(halfAngleRadian) * innerRadius * 2)) / 2;
                this.$slider.css('height', heightSlide + 'px');
                this.$slider.css('width', widthSlide + 'px');
                this.$slidesContainer.css('height', outerRadius * 2 + 'px');
                this.$slidesContainer.css('width', outerRadius * 2 + 'px');
                this.$slidesContainer.css('transform', 'translateX(-50%)');
                // this.$slidesContainer.css('top', '-' + upperArcHeight + 'px');
                this.$slidesContainer.css('top', this.settings.meTopCoef + 'px');
                var pathCoords = 'M 0 ' + fullArcHeight;
                pathCoords += ' A ' + (outerRadius + 40) + ' ' + (outerRadius + 40) + ' 0 0 1 ' + slideFullWidth + ' ' + fullArcHeight;
                pathCoords += ' L ' + (slideFullWidth - lowerArcOffset) + ' ' + slideFullHeight;
                pathCoords += ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + lowerArcOffset + ' ' + slideFullHeight + ' Z';
                let nameSvg;
                this.$slider[0].classList.forEach(function(item) {
                    if (item === 'rotating-slider--main') nameSvg = 'slideClipPathMe';
                    else nameSvg = 'none';
                });
                this.$slider.append(`<svg><defs><clipPath id="${nameSvg}"><path/></clipPath></defs></svg>`);
                this.$slider.find(`#${nameSvg}>path`).attr('d', pathCoords);


                halfAngleRadian = this.slideAngle / 2 * Math.PI / 180;
                innerRadius = (1 / Math.tan(halfAngleRadian) * this.settings.slideWidth / 2) * this.settings.meInnerRadiusCoef;
                outerRadius = Math.sqrt(Math.pow(innerRadius + this.settings.slideHeight, 2) + (Math.pow((this.settings.slideWidth / 2), 2)));
                upperArcHeight = outerRadius - (innerRadius + this.settings.slideHeight);

                lowerArcHeight = innerRadius - (innerRadius * (Math.cos(halfAngleRadian)));
                slideFullWidth = (((Math.sin(halfAngleRadian) * outerRadius) * 2));
                slideFullHeight = upperArcHeight + this.settings.slideHeight + lowerArcHeight
                slideSidePadding = (slideFullWidth - this.settings.slideWidth) / 2;
                fullArcHeight = outerRadius - (outerRadius * (Math.cos(halfAngleRadian)));
                lowerArcOffset = (slideFullWidth - (Math.sin(halfAngleRadian) * innerRadius * 2)) / 2;
                this.$slider.css('height', this.settings.slideHeight + 'px');
                this.$slider.css('width', this.settings.slideWidth + 'px');
                this.$slidesContainer.css('height', outerRadius * 2 + 'px');
                this.$slidesContainer.css('width', outerRadius * 2 + 'px');
                this.$slidesContainer.css('transform', 'translateX(-50%)');
                // this.$slidesContainer.css('top', '-' + (upperArcHeight + this.settings.meTopCoef) + 'px');
                this.$slidesContainer.css('top', this.settings.meTopCoef + 'px');
                pathCoords = 'M 0 ' + fullArcHeight;
                pathCoords += ' A ' + (outerRadius + 40) + ' ' + (outerRadius + 40) + ' 0 0 1 ' + slideFullWidth + ' ' + fullArcHeight;
                pathCoords += ' L ' + (slideFullWidth - lowerArcOffset) + ' ' + slideFullHeight;
                pathCoords += ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + lowerArcOffset + ' ' + slideFullHeight + ' Z';
                nameSvg;
                this.$slider[0].classList.forEach(function(item) {
                    if (item === 'rotating-slider--main') nameSvg = 'slideClipPath';
                    else nameSvg = 'none';
                });
                this.$slider.append(`<svg><defs><clipPath id="${nameSvg}"><path/></clipPath></defs></svg>`);
                this.$slider.find(`#${nameSvg}>path`).attr('d', pathCoords);




                // $('.slides__dot').each(function(i, item) {
                //     var $slide = $(item);
                //     $slide.css('transform-origin', 'center ' + (innerRadius + 36) + 'px');
                //     $slide.css('height', 36 + 'px');
                //     $slide.css('width', 36 + 'px');
                //     // $slide.css('padding', upperArcHeight + 'px ' + slideSidePadding + 'px ' + lowerArcHeight + 'px ' + slideSidePadding + 'px ');
                //     $slide.css('top', upperArcHeight + 'px');
                //     $slide.css('transform', 'translateX(-50%) rotate(' + -this.slideAngle * i + 'deg) translateY(-' + upperArcHeight + 'px)');
                //     // $slide.css('-webkit-clip-path', 'url(#slideClipPath)');
                //     // $slide.css('clip-path', 'url(#slideClipPath)');
                // }.bind(this));
                this.$slides.each(function(i, el) {

                    // this.settings.slideWidth = 120;
                    // this.settings.slideHeight = 140;
                    var $slide = $(el);
                    $slide.css('transform-origin', 'center ' + (innerRadius + this.settings.slideHeight) + 'px');
                    $slide.css('height', this.settings.slideHeight + 'px');
                    $slide.css('width', this.settings.slideWidth + 'px');
                    $slide.css('padding', (upperArcHeight * this.settings.mePaddingCoef) + 'px ' + (slideSidePadding * this.settings.mePaddingCoef) + 'px ' + (lowerArcHeight * this.settings.mePaddingCoef) + 'px ' + (slideSidePadding * this.settings.mePaddingCoef) + 'px ');
                    $slide.css('top', upperArcHeight + 'px');
                    $slide.css('transform', 'translateX(-50%) rotate(' + -this.slideAngle * i + 'deg) translateY(-' + upperArcHeight + 'px)');
                    let nameSvg;
                    this.$slider[0].classList.forEach(function(item) {
                        if (item === 'rotating-slider--main') nameSvg = 'slideClipPath';
                        else nameSvg = 'slideClipPathDay';
                    });
                    $slide.css('-webkit-clip-path', `url(#${nameSvg})`);
                    $slide.css('clip-path', `url(#${nameSvg})`);

                }.bind(this));

            },
            rotateClockwise: function() {
                this.currentRotationAngle = this.currentRotationAngle + this.slideAngle;
                this.rotate()
            },
            rotateCounterClockwise: function() {
                this.currentRotationAngle = this.currentRotationAngle - this.slideAngle;
                this.rotate()
            },
            rotate: function() {
                this.currentlyRotating = !0;
                if (this.rotateTimeoutId) {
                    clearTimeout(this.rotateTimeoutId);
                    this.rotateTimeoutId = !1
                }
                this.$slidesContainer.css('transition', 'transform ' + (this.settings.rotationSpeed / 1000) + 's ease-in-out');
                this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + -this.currentRotationAngle + 'deg)');
                this.rotateTimeoutId = setTimeout(function() {
                    this.currentlyRotating = !1;
                    this.$slidesContainer.css('transition', 'none');
                    if (this.currentRotationAngle >= 360 || this.currentRotationAngle <= -360) {
                        this.currentRotationAngle = this.currentRotationAngle >= 360 ? this.currentRotationAngle - 360 : this.currentRotationAngle + 360;
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + -this.currentRotationAngle + 'deg)')
                    }
                }.bind(this), this.settings.rotationSpeed)
            },
            startAutoRotate: function() {
                this.autoRotateIntervalId = setInterval(function() { this.rotateCounterClockwise() }.bind(this), this.settings.autoRotateInterval)
            },
            stopAutoRotate: function() {
                if (this.autoRotateIntervalId) {
                    clearInterval(this.autoRotateIntervalId);
                    this.autoRotateIntervalId = !1
                }
            },
            validateMarkup: function() {
                if (this.$slider.hasClass('rotating-slider') && this.$slidesContainer.length === 1 && this.$slides.length >= 2) {
                    this.markupIsValid = !0
                } else {
                    this.$slider.css('display', 'none');
                }
            }
        }
        return this.each(function() { rotatingSlider.init(this) })
    }
    $('.rotating-slider--main').rotatingSlider({
        autoRotate: false,
        autoRotateInterval: 2000,
        draggable: true,
        directionControls: false,
        directionLeftText: '&lsaquo;',
        directionRightText: '&rsaquo;',
        rotationSpeed: 250,
        slideWidth: 120,
        slideHeight: 120,
        /* Callback Functions */
        beforeRotationStart: function() {},
        afterRotationStart: function() {},
        beforeRotationEnd: function() {},
        afterRotationEnd: function() {}
    });

    // /rotating slider (jQuery)

    let $slide = document.querySelectorAll('.slide--main');


    function createRotatingSlider(name, _autoRotate, _autoRotateInterval, _draggable, _directionControls, _directionLeftText, _directionRightText, _rotationSpeed, _slideWidth, _slideHeight, _meTopCoef, _meInnerRadiusCoef, _mePaddingCoef) {
        $(name).rotatingSlider({
            autoRotate: _autoRotate,
            autoRotateInterval: _autoRotateInterval,
            draggable: _draggable,
            directionControls: _directionControls,
            directionLeftText: _directionLeftText,
            directionRightText: _directionRightText,
            rotationSpeed: _rotationSpeed,
            slideWidth: _slideWidth,
            slideHeight: _slideHeight,
            meTopCoef: _meTopCoef,
            meInnerRadiusCoef: _meInnerRadiusCoef,
            mePaddingCoef: _mePaddingCoef,
            beforeRotationStart: function() {},
            afterRotationStart: function() {},
            beforeRotationEnd: function() {},
            afterRotationEnd: function() {}
        });
    }

    function addModifierElement(_element, master = false, modifier) {
        if (master) document.querySelectorAll(`.${_element.classList[0]}--${modifier}`).forEach(function(item) {
            item.classList.toggle(`${_element.classList[0]}--${modifier}`);
        });
        if (Array.isArray(_element) || _element.length !== undefined) _element.forEach(function(item) {
            item.classList.toggle(`${item.classList[0]}--${modifier}`);
        });
        else _element.classList.toggle(`${_element.classList[0]}--${modifier}`);
    }


    $slide.forEach(function(item, index) {
        item.addEventListener('mouseenter', hoverSliderElement.bind(item, index, undefined, undefined, undefined, undefined), false);
        item.addEventListener('mouseleave', hoverSliderElement.bind(item, index, 120, 120, 'slideClipPath', 0), false);
        item.addEventListener('click', clickSliderElement, false);
        let _className,
            _innerRadius = 2.07;
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__junuary')) _className = '.rotating-slider__junuary';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__february')) {
            _className = '.rotating-slider__february';
            _innerRadius = 2.3;
        };
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__march')) _className = '.rotating-slider__march';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__april')) {
            _className = '.rotating-slider__april';
            _innerRadius = 2.13;
        };
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__may')) _className = '.rotating-slider__may';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__june')) {
            _className = '.rotating-slider__june';
            _innerRadius = 2.13;
        };
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__july')) _className = '.rotating-slider__july';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__august')) _className = '.rotating-slider__august';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__september')) {
            _className = '.rotating-slider__september';
            _innerRadius = 2.13;
        };
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__october')) _className = '.rotating-slider__october';
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__november')) {
            _className = '.rotating-slider__november';
            _innerRadius = 2.13;
        };
        if (item.closest('.rotating-slider').querySelectorAll('.rotating-slider')[index].classList.contains('rotating-slider__december')) _className = '.rotating-slider__december';


        item.addEventListener('click', addModifierElement.bind(null, document.querySelector(_className), true, 'active'), false);
        item.addEventListener('click', createRotatingSlider.bind(null, _className, false, 2000, true, false, '&lsaquo;', '&rsaquo;', 250, 26, 26, 110, _innerRadius, 0), false);
        item.addEventListener('click', addModifierElement.bind(null, document.querySelector(_className).querySelectorAll('.slide--day'), 0, 'active'), false);
        item.addEventListener('click', switchSliderText.bind(item, undefined), false);
        item.addEventListener('click', clickDay, false);
    });



    function clickDay() {
        let _this = this;
        console.log(event.target);
        document.querySelectorAll('.slide--active').forEach(function(item, index) {
            item.addEventListener('click', switchSliderText.bind(_this, index), false);
        });
    }

    function switchSliderText(index = 0) {
        addModifierElement(document.querySelector('.circle__center-title'), 0, 'hidden');
        addModifierElement(document.querySelector('.circle__center-text'), 0, 'hidden');
        addModifierElement(this.closest('.rotating-slider').querySelectorAll('.rotating-slider--active .slide')[index], 1, 'select');
        let _this = this;
        setTimeout(function() {
            document.querySelector('.circle__center-title').innerHTML = _this.closest('.rotating-slider').querySelectorAll('.rotating-slider--active .day-info__title')[index].innerHTML;
            addModifierElement(document.querySelector('.circle__center-title'), 0, 'hidden');
            document.querySelector('.circle__center-text').innerHTML = _this.closest('.rotating-slider').querySelectorAll('.rotating-slider--active .day-info__text')[index].innerHTML;
            addModifierElement(document.querySelector('.circle__center-text'), 0, 'hidden');
        }, 350);

    }

    function clickSliderElement() {
        if (document.querySelectorAll('.slide--active') !== null) addModifierElement(document.querySelectorAll('.slide--active'), 0, 'active');
    }

    function hoverSliderElement(index, width = widthSlide, height = heightSlide, svgName = 'slideClipPathMe', coef = 17) {
        this.$slider = $('.rotating-slider--main');
        this.$slidesContainer = this.$slider.children('ul.slides');
        this.$slides = this.$slidesContainer.children('li');
        this.slideAngle = 360 / this.$slides.length;
        var $slide = $(this);
        var halfAngleRadian = this.slideAngle / 2 * Math.PI / 180;
        var innerRadius = (1 / Math.tan(halfAngleRadian) * height / 2) * 1.23;
        var outerRadius = Math.sqrt(Math.pow(innerRadius + height, 2) + (Math.pow((widthSlide / 2), 2)));
        let upperArcHeight = outerRadius - (innerRadius + width);
        let lowerArcHeight = innerRadius - (innerRadius * (Math.cos(halfAngleRadian)));
        var slideFullWidth = (((Math.sin(halfAngleRadian) * outerRadius) * 2));
        var slideFullHeight = upperArcHeight + height + lowerArcHeight
        var slideSidePadding = (slideFullWidth - width) / 2;
        var fullArcHeight = outerRadius - (outerRadius * (Math.cos(halfAngleRadian)));
        var lowerArcOffset = (slideFullWidth - (Math.sin(halfAngleRadian) * innerRadius * 2)) / 2;
        this.$slider.css('height', height + 'px');
        this.$slider.css('width', width + 'px');
        $slide.css('height', height + 'px');
        $slide.css('width', width + 'px');
        $slide.css('padding', upperArcHeight + 'px ' + (slideSidePadding - coef) + 'px ' + lowerArcHeight + 'px ' + (slideSidePadding - coef) + 'px ');
        $slide.css('transform', 'translateX(-50%) rotate(' + -this.slideAngle * index + 'deg) translateY(-' + upperArcHeight + 'px)');
        $slide.css('-webkit-clip-path', `url(#${svgName})`);
        $slide.css('clip-path', `url(#${svgName})`);
    }
});