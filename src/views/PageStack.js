define(function(require, exports, module) {
    var View           = require('famous/core/View');
    var Entity         = require('famous/core/Entity');
    var Engine         = require('famous/core/Engine');
    var Surface        = require('famous/core/Surface');
    var Transform      = require('famous/core/Transform');
    var RenderNode     = require('famous/core/RenderNode');
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing         = require('famous/transitions/Easing');
    var MathUtilities  = require('famous/utilities/MathUtilities');
    var Utility        = require('famous/utilities/Utility');

    var TouchSync = require('famous/inputs/TouchSync');

    function PageStack() {
        View.apply(this, arguments);

        // this.id = Entity.register(this);
        this.state = new Transitionable(0);
        this.sync = new TouchSync({direction: 0});

        _createNodes.call(this);
        _createShadow.call(this);
        _createDragSurface.call(this);

        this.sync.on('start', _handleSyncStart.bind(this));
        this.sync.on('update', _handleSyncUpdate.bind(this));
        this.sync.on('end', _handleSyncEnd.bind(this));

        window.addEventListener('native.keyboardshow', function() {
            this.keyboard = true;
        }.bind(this), false);

        window.addEventListener('native.keyboardhide', function() {
            this.keyboard = false;
        }.bind(this), false);

        this.width = innerWidth;
        _setStates.call(this, innerWidth);
    }

    PageStack.prototype = Object.create(View.prototype);
    PageStack.prototype.constructor = PageStack;

    PageStack.DEFAULT_OPTIONS = {
        transition: {
            duration: 350,
            curve: 'easeInOut'
        },
        dragWidth: 15,
        velocityThreshold: 0.5,
        delay: 100
    };

    function _createNodes() {
        function PageNode(state) {
            RenderNode.apply(this, arguments);
            this.state = state;

            this.shadow = new Surface({
                properties: {
                    boxShadow: '0 0 20px black',
                    pointerEvents: 'none'
                }
            });
        }

        PageNode.prototype = Object.create(RenderNode.prototype);
        PageNode.prototype.constructor = PageNode;

        PageNode.prototype.render = function() {
            if (!this.endTranslate) this.endTranslate = this.startTranslate;
            if (this.endOpacity === undefined) this.endOpacity = this.startOpacity;
            var state = this.state.get();
            return {
                target: [
                    { target: this.page.render() },
                    { target: this.shadow.render(), opacity: MathUtilities.interpolate(this.startOpacity, this.endOpacity, state) }
                ],
                transform: Transform.translate(
                    MathUtilities.interpolate(this.startTranslate[0], this.endTranslate[0], state),
                    MathUtilities.interpolate(this.startTranslate[1], this.endTranslate[1], state),
                    MathUtilities.interpolate(this.startTranslate[2], this.endTranslate[2], state)
                )
            };
        };

        this.current = new PageNode(this.state);
        this.next = new PageNode(this.state);
        this.previous = new PageNode(this.state);
    }

    function _createShadow() {
        this.next.shadow = new Surface({
            properties: {
                boxShadow: '0 0 30px black',
                pointerEvents: 'none'
            }
        });
    }

    function _createDragSurface() {
        this.dragSurface = new Surface({
            size: [this.options.dragWidth, undefined]
        });

        this.dragSurface.pipe(this.sync);
    }

    function _setStates(width) {
        this.translates = {
            current: [0, 0, 0],
            previous: [-width/3, 0, -5],
            next: [width, 0, 5]
        };

        _resetStates.call(this);
    }

    function _resetStates() {
        this.current.startTranslate = this.translates.current;
        this.previous.startTranslate = this.translates.previous;
        this.next.startTranslate = this.translates.next;
        this.current.startOpacity = 0;
        this.previous.startOpacity = 0;
        this.next.startOpacity = 0;
    }

    function _setNextState() {
        _resetStates.call(this);
        this.previous.page = null;
        this.current.endTranslate = this.translates.previous;
        this.next.endTranslate = this.translates.current;
        // this.current.endOpacity = 1;
        this.next.endOpacity = 1;
    }

    function _transitionNext(cb, noBack) {
        _setNextState.call(this);
        setTimeout(function() {
            this.state.set(1, this.options.transition, function() {
                Engine.nextTick(function() {
                    this.state.set(0);
                    this.previous.page = noBack ? null : this.current.page;
                    this.current.page = this.next.page;
                    this.next.page = null;
                    _resetStates.call(this);
                    if (cb) cb();
                }.bind(this));
            }.bind(this));
        }.bind(this), this.options.delay);
    }

    function _startPrevious() {
        _resetStates.call(this);
        this.current.startOpacity = 1;
        this.current.endOpacity = 0;
        this.current.endTranslate = this.translates.next;
        this.previous.endTranslate = this.translates.current;
        // this.previous.startOpacity = 1;
        // this.previous.endOpacity = 0;
    }

    function _transitionPrevious(cb) {
        _startPrevious.call(this);
        setTimeout(function() {
            this.state.set(1, this.options.transition, function() {
                _endPrevious.call(this);
                if (cb) cb();
            }.bind(this));
        }.bind(this), this.options.delay);
    }

    function _endPrevious() {
        Engine.nextTick(function() {
            this.state.set(0);
            this.current.page = this.previous.page;
            this.previous.page = this.previous.page.prevPage;
            this.next.page = null;
            _resetStates.call(this);
        }.bind(this));
    }

    function _handleSyncStart(data) {
        if (this.state.get() || !this.previous.page) return;
        this.draggable = true;
        _startPrevious.call(this);
    }

    function _handleSyncUpdate(data) {
        if (!this.previous.page || !this.draggable) return;
        var state = Math.min(Math.max(data.position/this.width, 0), 1);
        this.state.set(state);
    }

    function _handleSyncEnd(data) {
        if (!this.previous.page || !this.draggable) return;
        this.draggable = false;
        var endState;
        var velocity = data.velocity;
        var state = Math.min(Math.max(data.position/this.width, 0), 1);
        if (state > 0.5)
            if (velocity < -this.options.velocityThreshold) endState = 0;
            else endState = 1;
        else
            if (velocity > this.options.velocityThreshold) endState = 1;
            else endState = 0;
        var callback = endState ? _endPrevious.bind(this) : null;

        var transition = Utility.clone(this.options.transition);
        transition.duration *= Math.abs(endState - this.state.get());

        this.state.set(endState, transition, callback);
    }

    PageStack.prototype.addCache = function(views) {
        for (var key in views) {
            var page = views[key];
            page.__cached = true;
            page.__cacheKey = key;
            this.cache[key] = page;
        }
    };
    
    PageStack.prototype.addPage = function(page, cb, noBack) {
        if (this.state.get()) return;
        if (!this.current.page) {
            this.current.page = page;
            return;
        }
        if (page === this.current.page) return;
        page.prevPage = this.current.page;
        this.next.page = page;
        Engine.nextTick(function() {
            _transitionNext.call(this, cb, noBack);
        }.bind(this));
    };

    PageStack.prototype.removePage = function(page, cb) {
        if (this.state.get() || (!this.previous.page && !page)) return;
        if (!this.current.page) {
            this.current.page = page;
            return;
        }
        if (page) this.previous.page = page;
        Engine.nextTick(function() {
            _transitionPrevious.call(this, cb);
        }.bind(this));
    };

    PageStack.prototype.reset = function() {
        this.current.page = null;
        this.next.page = null;
        this.previous.page = null;
    };

    PageStack.prototype.getCurrentPage = function() {
        return this.current.page;
    };

    PageStack.prototype.render = function() {
        var specs = [];
        if (this.current.page) specs.push({ target: this.current.render() });
        if (this.next.page) specs.push({ target: this.next.render() });
        if (this.previous.page && !this.keyboard) specs.push({ target: this.previous.render() });
        specs.push({ target: this.dragSurface.render(), transform: Transform.translate(0, 0, 2) });
        return specs;
        // return this.id;
    };

    PageStack.prototype.commit = function(context) {
        if (this.width !== context.size[0]) {
            var width = context.size[0];
            _setStates.call(this, width);
            this.width = width;
        }
        var specs = [];
        if (this.current.page) specs.push({ target: this.current.render() });
        if (this.next.page) specs.push({ target: this.next.render() });
        if (this.previous.page) specs.push({ target: this.previous.render() });
        specs.push({ target: this.dragSurface.render(), transform: Transform.translate(0, 0, 2) });
        context.target = specs;
        return context;
    };

    module.exports = PageStack;
});
