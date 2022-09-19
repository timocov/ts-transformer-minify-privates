"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this.publicField = 123;
        Class.privateStaticPropertyMethod();
        Class.privateStaticMethod();
    }
    Class.privateStaticMethod = function () {
    };
    Class.privateStaticPropertyMethod = function () {
    };
    return Class;
}());
exports.Class = Class;
