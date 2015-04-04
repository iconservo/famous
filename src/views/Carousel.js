/*
    var Engine = require('famous/core/Engine');
    var Carousel = require('famous/views/Carousel');
    var Surface = require('famous/core/Surface');

    var mainContext = Engine.createContext();
    var carousel = new Carousel();

    var items = [];
    var n = 5;
    for (var i = 0; i < n; i++) {
        var surface = new Surface({
            content: i + '',
            size: [260, 200],
            properties: {
                backgroundColor: 'hsl(' + 360/n * i + ', 100%, 50%)'
            }
        });

        items.push(surface);
    }

    carousel.sequenceFrom(items);
    mainContext.add(carousel);
*/

define(function(require, exports, module) {
    var Engine           = require('famous/core/Engine');
    var View             = require('famous/core/View');
    var Entity           = require('famous/core/Entity');
    var Element          = require('famous/core/Element');
    var Surface          = require('famous/core/Surface');
    var Transform        = require('famous/core/Transform');
    var ViewSequence     = require('famous/core/ViewSequence');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var Transitionable   = require('famous/transitions/Transitionable');
    var Easing           = require('famous/transitions/Easing');
    var GenericSync      = require('famous/inputs/GenericSync');
    var TouchSync        = require('famous/inputs/TouchSync');
    var MouseSync        = require('famous/inputs/MouseSync');
    var ScrollSync       = require('famous/inputs/ScrollSync');

    GenericSync.register({
        'mouse'  : MouseSync,
        'touch'  : TouchSync,
        'scroll' : ScrollSync
    });

    function Carousel() {
        View.apply(this, arguments);

        this.id = Entity.register(this);
        this.position = new Transitionable(0);

        _createBackground.call(this);
        _createSync.call(this);
    }

    Carousel.prototype = Object.create(View.prototype);
    Carousel.prototype.constructor = Carousel;

    Carousel.DEFAULT_OPTIONS = {
        loop: false,
        positionThreshold: 75,
        velocityThreshold: 0.2,
        transition: {
            curve: 'easeOut',
            duration: 250
        },
        dotSize: 10,
        dotMargin: 50,
        dotSpacing: 10,
        dotColor: 'white',
        dotOpacity: 0.5
    };

    function _createBackground() {
        this.background = new Surface();
        this.subscribe(this.background);
    }

    function _createSync() {
        this.sync = new GenericSync({
            'mouse'  : {direction: 0},
            'touch'  : {direction: 0},
            'scroll' : {direction: 0, scale : 0.5}
        });

        this.sync.on('update', function(data) {
            var position = this.position.get() + data.delta;
            this.position.set(position);
        }.bind(this));

        this.sync.on('end', function(data) {
            var velocity = data.velocity;
            var position = this.position.get();
            if (this.prev && (position > this.options.positionThreshold || velocity > this.options.velocityThreshold))
                _goToPrevPage.call(this);
            else if (this.next && (position < -this.options.positionThreshold || velocity < -this.options.velocityThreshold))
                _goToNextPage.call(this);
            else this.position.set(0, this.options.transition);
        }.bind(this));

        this._eventInput.pipe(this.sync);
    }

    function _createDots() {
        this.dots = [];
        this.dotRow = new SequentialLayout({
            direction: 0,
            itemSpacing: this.options.dotSpacing
        });
        for (var i = 0; i < this.numItems; i++) {
            var dot = new Element({
                target: new Surface({
                    size: [this.options.dotSize, this.options.dotSize],
                    properties: {
                        backgroundColor: this.options.dotColor,
                        borderRadius: this.options.dotSize + 'px'
                    }
                }),
                opacity: this.options.dotOpacity
            });
            this.dots.push(dot);
        }

        this.dotRow.sequenceFrom(this.dots);
        _updateDots.call(this, this.index);
    }

    function _goToPrevPage() {
        this.position.set(this.offset, this.options.transition, function() {
            Engine.nextTick(function() {
                this.position.set(0);
                this.next = this.current;
                this.unsubscribe(this.current.get());
                this.current = this.prev;
                this.subscribe(this.current.get());
                this.prev = this.current.getPrevious();
                _updateDots.call(this, this.index - 1);
            }.bind(this));
        }.bind(this));
    }

    function _goToNextPage() {
        this.position.set(-this.offset, this.options.transition, function() {
            Engine.nextTick(function() {
                this.position.set(0);
                this.prev = this.current;
                this.unsubscribe(this.current.get());
                this.current = this.next;
                this.subscribe(this.current.get());
                this.next = this.current.getNext();
                _updateDots.call(this, this.index + 1);
            }.bind(this));
        }.bind(this));
    }

    function _updateDots(newIndex) {
        this.dots[this.index].setOpacity(this.options.dotOpacity);
        this.index = newIndex;
        if (this.index >= this.numItems) this.index -= this.numItems;
        if (this.index < 0) this.index += this.numItems;
        this.dots[this.index].setOpacity(1);
    }

    Carousel.prototype.sequenceFrom = function(items) {
        this.numItems = items.length;
        this.items = new ViewSequence({
            array: items,
            loop: this.options.loop
        });
        this.current = this.items;
        this.next = this.items.getNext();
        this.prev = this.items.getPrevious();
        this.index = 0;

        this.subscribe(this.current.get());
        _createDots.call(this);
    };

    Carousel.prototype.render = function() {
        return this.id;
    };

    Carousel.prototype.commit = function(context) {
        if (!this.numItems) return;
        this.offset = context.size[0];
        return [
            {
                target: this.background.render()
            },
            {
                target: [
                    {
                        target: this.prev && this.prev.render(),
                        transform: Transform.translate(-this.offset, 0, 0),
                        origin: [0.5, 0.5],
                        align: [0.5, 0.5]
                    },
                    {
                        target: this.current.render(),
                        transform: Transform.translate(0, 0, 0),
                        origin: [0.5, 0.5],
                        align: [0.5, 0.5]
                    },
                    {
                        target: this.next && this.next.render(),
                        transform: Transform.translate(this.offset, 0, 0),
                        origin: [0.5, 0.5],
                        align: [0.5, 0.5]
                    }
                ],
                size: [context.size[0], context.size[1] - this.options.dotMargin],
                transform: Transform.translate(this.position.get(), 0, 1),
                origin: [0.5, 0],
                align: [0.5, 0]
            },
            {
                target: this.dotRow.render(),
                size: this.dotRow.getSize(),
                transform: Transform.translate(0, -this.options.dotMargin/2 + this.options.dotSize/2, 2),
                origin: [0.5, 1],
                align: [0.5, 1]
            }
        ];
    };

    module.exports = Carousel;
});
