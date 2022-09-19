"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = /** @class */ (function () {
    function Class(publicField, protectedField, _private_privateField) {
        this.publicField = publicField;
        this.protectedField = protectedField;
        this._private_privateField = _private_privateField;
    }
    Class.prototype.method = function () {
        console.log(this.publicField, this.protectedField, this._private_privateField);
    };
    return Class;
}());
exports.Class = Class;
