export class FooBar {
    constructor() {
        this.publicField = 123;
        this._private_privateField = 'sda';
        this._private_privateMethod(this._private_privateField);
        this._private_privateMethod(this.publicField);
        this["_private_privateMethod"](this._private_privateField);
    }
    _private_privateMethod(a) { }
}
