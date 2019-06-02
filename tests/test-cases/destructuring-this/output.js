"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        this.publicField = 123;
        this.publicMethod();
        this._private_privateMethod(this._private_privateField, this.publicField);
    }
    Class.prototype.publicMethod = function () {
        var _a = this, privateField = _a._private_privateField, publicField = _a.publicField;
        this._private_privateMethod(privateField, publicField);
    };
    Class.prototype._private_privateMethod = function (a, b) {
    };
    return Class;
}());
exports.Class = Class;
