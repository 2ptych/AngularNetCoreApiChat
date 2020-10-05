"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationModel = /** @class */ (function () {
    function NotificationModel(part) {
        //Object.assign(this, part);
    }
    return NotificationModel;
}());
exports.NotificationModel = NotificationModel;
var NoteType;
(function (NoteType) {
    NoteType[NoteType["Succes"] = 0] = "Succes";
    NoteType[NoteType["Info"] = 1] = "Info";
    NoteType[NoteType["Warning"] = 2] = "Warning";
    NoteType[NoteType["Error"] = 3] = "Error";
})(NoteType || (NoteType = {}));
//# sourceMappingURL=notification.model.js.map