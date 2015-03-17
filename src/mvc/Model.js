define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var Utility      = require('famous/utilities/Utility');

    function Model(values) {
        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._values = Utility.clone(this.constructor.DEFAULT_VALUES || Model.DEFAULT_VALUES);
        if (values) for (var key in values) this._values[key] = values[key];
    }

    Model.DEFAULT_VALUES = {};

    Model.prototype.setOptions = function(options) {
        this._optionsManager.patch(options);
    };

    Model.prototype.set = function(key, value, silent) {
        if (this._values[key] === value && silent) return;
        this._values[key] = value;
        if (!silent) this._eventOutput.emit('change:' + key, value);
    };

    Model.prototype.get = function(key) {
        return this._values[key];
    };

    module.exports = Model;
});
