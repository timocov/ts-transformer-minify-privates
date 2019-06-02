export class Class {
	private privateField: string = 'string-value';

	public constructor() {
		const that = this;
		that[Math.random() ? 'privateMethod' : 'publicMethod'](this.privateField);
		this[Math.random() ? 'privateMethod' : 'publicMethod'](this.privateField);
	}

	public publicMethod(): void {

	}

	private privateMethod(a: string): void {

	}
}
