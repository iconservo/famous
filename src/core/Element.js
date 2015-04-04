define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');

    function Element(options) {
        this.target = options.target;
        this.size = options.size;
        if (options.translate) this.transform = Transform.translate.apply(null, options.translate);
        this.origin = options.origin;
        this.opacity = options.opacity || 1;
    }

    Element.prototype.render = function() {
        var size = this.size;
        if (!size && this.target.getSize) size = this.target.getSize();
        if (size && (size[0] === 0 && size[1] === 0)) size = null;

        return {
            target: this.target.render(),
            size: size,
            transform: this.transform,
            origin: this.origin,
            align: this.origin,
            opacity: this.opacity
        };
    };

    Element.prototype.getSize = function() {
        var size = this.size;
        if (!size && this.target.getSize) size = this.target.getSize();
        return size;
    };

    Element.prototype.setOpacity = function(opacity) {
        this.opacity = opacity;
    };

    module.exports = Element;
});
