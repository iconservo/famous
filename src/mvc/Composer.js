define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    function Composer() {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
    }

    Composer.prototype.registerViewsActions = function(actionEvents) {
        for (var i = 0; i < actionEvents.length; i++) {
            var action = actionEvents[i];
            var view = action[0];
            var event = action[1];
            var handler = action[2] || this.viewsActions[event];
            view.on(event, handler);
        }
    };

    Composer.prototype.registerControllerActions = function(actionEvents, controller) {
        for (var i = 0; i < actionEvents.length; i++) {
            var event = actionEvents[i];
            var handler = this.controllerActions[event];
            controller.on(event, handler);
        }
    };

    Composer.prototype.relay = function(emitter, event, newEvent) {
        emitter.on(event, function(arg) {
            this._eventOutput.emit(newEvent || event, arg);
        }.bind(this));
    };

    module.exports = Composer;
});
