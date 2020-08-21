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
                console.log(this.$slider);
                this.$slidesContainer = this.$slider.children('ul.slides');
                this.$slides = this.$slidesContainer.children('li');
                this.$clipPath;
                this.$directionControls;
                this.settings = $.extend({ autoRotate: !0, autoRotateInterval: 6000, draggable: !0, directionControls: !0, directionLeftText: '&lsaquo;', directionRightText: '&rsaquo;', rotationSpeed: 750, slideHeight: 360, slideWidth: 480, }, options);
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
                var innerRadius = (1 / Math.tan(halfAngleRadian) * widthSlide / 2) * 1.23;
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
                this.$slidesContainer.css('top', '-' + upperArcHeight + 'px');
                var pathCoords = 'M 0 ' + fullArcHeight;
                pathCoords += ' A ' + (outerRadius + 40) + ' ' + (outerRadius + 40) + ' 0 0 1 ' + slideFullWidth + ' ' + fullArcHeight;
                pathCoords += ' L ' + (slideFullWidth - lowerArcOffset) + ' ' + slideFullHeight;
                pathCoords += ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + lowerArcOffset + ' ' + slideFullHeight + ' Z';
                this.$slider.append('<svg><defs><clipPath id="slideClipPathMe"><path/></clipPath></defs></svg>');
                this.$slider.find('#slideClipPathMe>path').attr('d', pathCoords);


                halfAngleRadian = this.slideAngle / 2 * Math.PI / 180;
                innerRadius = (1 / Math.tan(halfAngleRadian) * this.settings.slideWidth / 2) * 1.23;
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
                this.$slidesContainer.css('top', '-' + upperArcHeight + 'px');
                pathCoords = 'M 0 ' + fullArcHeight;
                pathCoords += ' A ' + (outerRadius + 40) + ' ' + (outerRadius + 40) + ' 0 0 1 ' + slideFullWidth + ' ' + fullArcHeight;
                pathCoords += ' L ' + (slideFullWidth - lowerArcOffset) + ' ' + slideFullHeight;
                pathCoords += ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + lowerArcOffset + ' ' + slideFullHeight + ' Z';
                this.$slider.append('<svg><defs><clipPath id="slideClipPath"><path /></clipPath></defs></svg>');
                this.$slider.find('#slideClipPath>path').attr('d', pathCoords);





                this.$slides.each(function(i, el) {

                    // this.settings.slideWidth = 120;
                    // this.settings.slideHeight = 140;
                    var $slide = $(el);
                    $slide.css('transform-origin', 'center ' + (innerRadius + this.settings.slideHeight) + 'px');
                    $slide.css('height', this.settings.slideHeight + 'px');
                    $slide.css('width', this.settings.slideWidth + 'px');
                    $slide.css('padding', upperArcHeight + 'px ' + slideSidePadding + 'px ' + lowerArcHeight + 'px ' + slideSidePadding + 'px ');
                    $slide.css('top', upperArcHeight + 'px');
                    $slide.css('transform', 'translateX(-50%) rotate(' + -this.slideAngle * i + 'deg) translateY(-' + upperArcHeight + 'px)');
                    $slide.css('-webkit-clip-path', 'url(#slideClipPath)');
                    $slide.css('clip-path', 'url(#slideClipPath)')
                }.bind(this));
                if (this.settings.directionControls) {
                    var directionArrowsHTML = '<ul class="direction-controls">';
                    directionArrowsHTML += '<li class="left-arrow"><button>' + this.settings.directionLeftText + '</button></li>';
                    directionArrowsHTML += '<li class="right-arrow"><button>' + this.settings.directionRightText + '</button></li>';
                    directionArrowsHTML += '</ul>';
                    this.$slider.append(directionArrowsHTML);
                    this.$directionControls = this.$slider.find('ul.direction-controls')
                }
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
    $('.rotating-slider').rotatingSlider({
        autoRotate: true,
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

    let $slide = document.querySelectorAll('.slide');

    $slide.forEach(function(item, index) {
        item.addEventListener('mouseenter', hoverSliderElement.bind(item, index, undefined, undefined, undefined, undefined), false);
        item.addEventListener('mouseleave', hoverSliderElement.bind(item, index, 120, 120, 'slideClipPath', 0), false);
    });


    function hoverSliderElement(index, width = widthSlide, height = heightSlide, svgName = 'slideClipPathMe', coef = 17) {
        this.$slider = $('.rotating-slider');
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