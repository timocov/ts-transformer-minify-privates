export class FooBar {
    constructor() {
        this.publicField = 123;
        FooBar.privateStaticPropertyMethod();
        FooBar.privateStaticMethod();
    }
    static privateStaticMethod() {
    }
}
FooBar.privateStaticPropertyMethod = () => {
};
