const obj = {};
export class Class {
    constructor() {
        this._private_privateField = 'string-value';
        this.publicField = 123;
        this[356] = 3;
        const that = this;
        this["_private_privateMethod"](this._private_privateField);
        that["_private_privateMethod"](this._private_privateField);
        obj['privateMethod'] = this._private_privateField;
        that._private_privateMethod2(this[356]);
    }
    _private_privateMethod(a) {
    }
    _private_privateMethod2(a) {
    }
}
