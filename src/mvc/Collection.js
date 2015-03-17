define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var Utility = require('famous/utilities/Utility');

    function Collection(values) {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._collection = [];
        this._values = Utility.clone(this.constructor.DEFAULT_VALUES || Collection.DEFAULT_VALUES);
        if (values) for (var key in values) this._values[key] = values[key];
    }

    Collection.DEFAULT_VALUES = {
    };

    Collection.prototype.setOptions = function(options) {
        this._optionsManager.patch(options);
    };

    // Sets property on collection
    Collection.prototype.set = function(key, value, silent) {
        if (this._values[key] === value && silent) return;
        this._values[key] = value;
        if (!silent) this._eventOutput.emit('change:' + key, value);
    };

    // Gets property on collection
    Collection.prototype.get = function(key) {
        return this._values[key];
    };

    Collection.prototype.addModel = function(model) {
        this._collection.push(model);
        this.subscribe(model);
        return model;
    };

    Collection.prototype.removeModel = function(model) {
        if (typeof model === 'number') {
            this._collection.splice(i, 1);
            return true;
        }
        for (var i = 0; i < this._collection.length; i++) {
            if (model === this._collection[i]) {
                this._collection.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    Collection.prototype.setModel = function(index, model) {
        return this._collection[index] = model;
    };

    Collection.prototype.getModel = function(index) {
        return this._collection[index];
    };

    Collection.prototype.forEach = function(func) {
        for (var i = 0; i < this._collection.length; i++) {
            func(this._collection[i]);
        }
    };

    Collection.prototype.length = function() {
        return this._collection.length;
    };
    module.exports = Collection;
});
