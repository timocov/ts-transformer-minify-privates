export class Class {
    constructor() {
        this.publicField = 123;
        Class.privateStaticPropertyMethod();
        Class.privateStaticMethod();
    }
    static privateStaticMethod() {
    }
}
Class.privateStaticPropertyMethod = () => {
};
