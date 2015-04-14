define(function(require, exports, module) {
    var Entity         = require('famous/core/Entity');
    var Utility        = require('famous/utilities/Utility');
    var OptionsManager = require('famous/core/OptionsManager');
    var Transform      = require('famous/core/Transform');

    function FlexSequence(options) {
        this.id = Entity.register(this);
        this.items = null;
        this.length = null;
        this.parentSize = null;

        this.options = Utility.clone(this.constructor.DEFAULT_OPTIONS || FlexSequence.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);
    }

    FlexSequence.DEFAULT_OPTIONS = {
        direction: 1,
        itemSpacing: 0,
        childOrigin: [0, 0]
    };

    FlexSequence.prototype.getOptions = function getOptions(key) {
        return this._optionsManager.getOptions(key);
    };

    FlexSequence.prototype.setOptions = function setOptions(options) {
        this._optionsManager.patch(options);
    };

    FlexSequence.prototype.sequenceFrom = function(items) {
        this.items = items;
    };

    FlexSequence.prototype.render = function() {
        return this.id;
    };

    FlexSequence.prototype.commit = function(context) {
        this.parentSize = context.size;
        if (!this.items) return context;

        var specs = [];
        var position = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var origin = this.options.childOrigin;
            var spacing = i ? this.options.itemSpacing : 0;
            if (!item.render) {
                spacing = item.itemSpacing || spacing;
                origin = item.origin || origin;
                item = item.renderable;
            }
            var offset = (item.getSize() && item.getSize()[this.options.direction]) || context.size[this.options.direction];
            var spec = {
                target: item.render(),
                size: item.getSize(),
                transform: Transform.translate(0, position + spacing, 0),
                origin: origin,
                align: origin
            }

            specs.push(spec);
            position += offset + spacing;
        }

        this.length = position;
        context.target = specs;
        return context;
    };

    FlexSequence.prototype.getSize = function() {
        if (!this.parentSize) return [undefined, undefined];
        if (this.options.direction) return [this.parentSize[0], this.length];
        else return [this.length, this.parentSize[1]];
    };

    module.exports = FlexSequence;
});
