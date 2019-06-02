export class Class {
	private privateField: string = 'string-value';
	public publicField: number = 123;

	public constructor() {
		this.publicMethod();
		this.privateMethod(this.privateField, this.publicField);
	}

	public publicMethod(): void {
		const {
			privateField,
			publicField,
		} = this;

		this.privateMethod(privateField, publicField);
	}

	private privateMethod(a: string, b: number): void {

	}
}
