define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    function Composer() {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
    }

    Composer.prototype.registerEvents = function(view, event, handler) {
        if (typeof event === 'string') view.on('event', handler);
        else {
            for (var key in event) {
                view.on(key, event[key]);
            }
        }
    };

    Composer.prototype.reEmit = function(view, event, newEvent) {
        view.on(event, function(arg) {
            this._eventOutput.emit(newEvent || event, arg);
        }.bind(this));
    };

    module.exports = Composer;
});
