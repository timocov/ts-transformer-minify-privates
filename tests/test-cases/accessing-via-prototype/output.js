export class Class {
    constructor() {
        this._private_privateField = 'string-value';
        Class.prototype._private_privateMethod.call(this, this._private_privateField);
        Class.prototype.publicMethod.call(this);
    }
    publicMethod() {
    }
    _private_privateMethod(a) {
    }
}
