define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');

    function Element(options) {
        this.target = options.target;
        if (options.position) this.translate = Transform.translate.apply(null, options.position);
        if (options.origin) this.origin = options.origin;
    }

    Element.prototype.render = function() {
        if (!this.target) return;
        return {
            target: this.target.render(),
            size: this.target.getSize && this.target.getSize(),
            transform: this.translate && this.translate,
            origin: this.origin && this.origin,
            align: this.align && this.origin
        };
    };

    module.exports = Element;
});
