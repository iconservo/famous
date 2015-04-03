define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');

    function Element(options) {
        this.target = options.target;
        this.size = options.size;
        if (options.translate) this.transform = Transform.translate.apply(null, options.translate);
        this.origin = options.origin;
    }

    Element.prototype.render = function() {
        var size = this.size;
        if (!size && this.target.getSize) size = this.target.getSize();

        return {
            target: this.target.render(),
            size: size,
            transform: this.transform,
            origin: this.origin,
            align: this.origin
        };
    };

    Element.prototype.getSize = function() {
        return this.target.getSize();
    };

    module.exports = Element;
});