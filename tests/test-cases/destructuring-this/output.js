"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        this._private_privateField2 = { prop: 'string-value' };
        this.publicField = 123;
        this.publicMethod();
        this._private_privateMethod(this._private_privateField, this.publicField, this._private_privateField2.prop);
    }
    Class.prototype.publicMethod = function () {
        var _a = this, privateField = _a._private_privateField, publicField = _a.publicField;
        var prop = this._private_privateField2.prop;
        this._private_privateMethod(privateField, publicField, prop);
    };
    Class.prototype._private_privateMethod = function (a, b, c) {
    };
    return Class;
}());
exports.Class = Class;
