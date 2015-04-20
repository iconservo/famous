define(function(require, exports, module) {
    var CachedMap        = require('famous/transitions/CachedMap');
    var Entity           = require('famous/core/Entity');
    var EventHandler     = require('famous/core/EventHandler');
    var Transform        = require('famous/core/Transform');
    var RenderController = require('famous/views/RenderController');

    function Paginator(options) {
        this._currentTarget = null;
        this._size = [undefined, undefined];

        _createCachedMaps.call(this);

        this._controller = new RenderController(options);

        this._entityId = Entity.register(this);
        if (options) this.setOptions(options);
    }

    function _createCachedMaps() {
        this.leftMap = CachedMap.create(_transformMapLeft.bind(this, 1));
        this.rightMap = CachedMap.create(_transformMapRight.bind(this, -1));
    }

    function _transformMapRight(zMax, progress) {
        return Transform.translate(this._size[0] * (1 - progress), 0, zMax * (1 - progress));
    }

    function _transformMapLeft(zMax, progress) {
        return Transform.translate(-this._size[0] * (1 - progress), 0, zMax * (1 - progress));
    }

    Paginator.prototype.pageRight = function(content) {
        this._controller.inTransformFrom(this.rightMap);
        this._controller.outTransformFrom(this.leftMap);
        this._currentTarget = content;
        this._controller.show.apply(this._controller, arguments);
    };

    Paginator.prototype.pageLeft = function(content) {
        this._controller.inTransformFrom(this.leftMap);
        this._controller.outTransformFrom(this.rightMap);
        this._currentTarget = content;
        this._controller.show.apply(this._controller, arguments);
    };

    Paginator.prototype.setOptions = function setOptions(options) {
        this._controller.setOptions(options);
    };

    Paginator.prototype.render = function render() {
        return this._entityId;
    };

    Paginator.prototype.commit = function commit(context) {
        this._size[0] = context.size[0];
        this._size[1] = context.size[1];

        return {
            transform: context.transform,
            opacity: context.opacity,
            origin: context.origin,
            size: context.size,
            target: this._controller.render()
        };
    };

    module.exports = Paginator;
});
