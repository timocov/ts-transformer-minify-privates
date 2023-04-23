"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = exports.Class = /** @class */ (function () {
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
