import * as ts from 'typescript';

import { PropertiesMinifier } from './properties-minifier';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	const minifier = new PropertiesMinifier({emitOriginalName: true });
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => minifier.visitSourceFile(file, program, context);
}
