"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
var MessageModel = /** @class */ (function () {
    function MessageModel(_sender, _reciever, _text, _date) {
        this.sender = _sender;
        this.reciever = _reciever;
        this.text = _text;
        this.date = _date || new Date();
    }
    return MessageModel;
}());
exports.MessageModel = MessageModel;
//# sourceMappingURL=message.model.js.map