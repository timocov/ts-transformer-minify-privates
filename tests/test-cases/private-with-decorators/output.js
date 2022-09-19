"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = /** @class */ (function () {
    function Class() {
        this.publicField = 123;
        //@ts-ignore
        this.privateField = 'string-value';
        this.privateMethod(this.privateField);
        this.privateMethod(this.publicField);
        this['privateMethod'](this.privateField);
    }
    //@ts-ignore
    Class.prototype.privateMethod = function (a) { };
    __decorate([
        decorator
    ], Class.prototype, "privateField", void 0);
    __decorate([
        decorator
    ], Class.prototype, "privateMethod", null);
    return Class;
}());
exports.Class = Class;
function decorator(target, propertyKey) { }
