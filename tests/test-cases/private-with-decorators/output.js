"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var tslib_1 = require("tslib");
var Class = exports.Class = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _privateField_decorators;
    var _privateField_initializers = [];
    var _privateMethod_decorators;
    return _a = /** @class */ (function () {
            function Class() {
                this.publicField = (tslib_1.__runInitializers(this, _instanceExtraInitializers), 123);
                //@ts-ignore
                this.privateField = tslib_1.__runInitializers(this, _privateField_initializers, 'string-value');
                this.privateMethod(this.privateField);
                this.privateMethod(this.publicField);
                this['privateMethod'](this.privateField);
            }
            //@ts-ignore
            Class.prototype.privateMethod = function (a) { };
            return Class;
        }()),
        (function () {
            _privateField_decorators = [decorator];
            _privateMethod_decorators = [decorator];
            tslib_1.__esDecorate(_a, null, _privateMethod_decorators, { kind: "method", name: "privateMethod", static: false, private: false, access: { has: function (obj) { return "privateMethod" in obj; }, get: function (obj) { return obj.privateMethod; } } }, null, _instanceExtraInitializers);
            tslib_1.__esDecorate(null, null, _privateField_decorators, { kind: "field", name: "privateField", static: false, private: false, access: { has: function (obj) { return "privateField" in obj; }, get: function (obj) { return obj.privateField; }, set: function (obj, value) { obj.privateField = value; } } }, _privateField_initializers, _instanceExtraInitializers);
        })(),
        _a;
}();
function decorator(target, propertyKey) { }
