export class FooBar {
	public publicField: number = 123;

	public constructor() {
		FooBar.privateStaticPropertyMethod();
		FooBar.privateStaticMethod();
	}

	private static privateStaticMethod(): void {

	}

	private static privateStaticPropertyMethod = () => {

	}
}
