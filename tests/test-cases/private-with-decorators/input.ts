export class Class {
	public publicField: number = 123;
	//@ts-ignore
	@decorator private privateField: string = 'string-value';

	public constructor() {
		this.privateMethod(this.privateField);
		this.privateMethod(this.publicField);

		this['privateMethod'](this.privateField);
	}

	//@ts-ignore
	@decorator private privateMethod(a: string | number): void { }
}

function decorator(target: any, propertyKey: string): void {}
