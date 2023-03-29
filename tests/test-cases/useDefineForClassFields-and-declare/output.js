var Class = /** @class */ (function () {
    function Class() {
    }
    Object.defineProperty(Class.prototype, "method", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            console.log(this.publicField, this.protectedField, this.privateField);
        }
    });
    return Class;
}());
