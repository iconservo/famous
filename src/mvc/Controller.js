define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    function Controller() {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
    }

    module.exports = Controller;
});
