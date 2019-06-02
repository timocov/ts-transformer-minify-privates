const obj: Record<string, string> = {};

export class FooBar {
	private privateField: string = 'sda';
	public publicField: number = 123;
	private 356: number = 3;

	public constructor() {
		const that = this;

		this['privateMethod'](this.privateField);
		that['privateMethod'](this.privateField);

		obj['privateMethod'] = this.privateField;

		that.privateMethod2(this[356]);
	}

	private privateMethod(a: string): void {

	}

	private privateMethod2(a: number): void {

	}
}
