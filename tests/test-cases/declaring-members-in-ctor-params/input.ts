export class Class {
	public constructor(
		public publicField: number,
		protected protectedField: number,
		private privateField: number
	) {}

	public method(): void {
		console.log(this.publicField, this.protectedField, this.privateField);
	}
}
