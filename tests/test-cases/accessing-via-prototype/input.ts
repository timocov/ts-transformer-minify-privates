export class FooBar {
	private privateField: string = 'sda';

	public constructor() {
		FooBar.prototype.privateMethod.call(this, this.privateField);

		FooBar.prototype.publicMethod.call(this);
	}

	public publicMethod(): void {

	}

	private privateMethod(a: string): void {

	}
}
