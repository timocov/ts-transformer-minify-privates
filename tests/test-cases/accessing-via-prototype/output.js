export class FooBar {
    constructor() {
        this._private_privateField = 'sda';
        FooBar.prototype._private_privateMethod.call(this, this._private_privateField);
        FooBar.prototype.publicMethod.call(this);
    }
    publicMethod() {
    }
    _private_privateMethod(a) {
    }
}
