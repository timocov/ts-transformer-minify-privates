import * as ts from 'typescript';

import { PropertiesMinifier, PropertyMinifierOptions } from './properties-minifier';

// tslint:disable-next-line:no-default-export
export default function minifyPrivatesTransformer(program: ts.Program, config?: Partial<PropertyMinifierOptions>): ts.TransformerFactory<ts.SourceFile> {
	const minifier = new PropertiesMinifier({ emitOriginalName: true, ...config });
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => minifier.visitSourceFile(file, program, context);
}
