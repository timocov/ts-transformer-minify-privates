"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        var that = this;
        that[Math.random() ? '_private_privateMethod' : 'publicMethod'](this._private_privateField);
        this[Math.random() ? '_private_privateMethod' : 'publicMethod'](this._private_privateField);
    }
    Class.prototype.publicMethod = function () {
    };
    Class.prototype._private_privateMethod = function (a) {
    };
    return Class;
}());
exports.Class = Class;
