import * as ts from 'typescript';

import { PropertiesMinifier } from './properties-minifier';

export interface PluginConfig {
	emitOriginalName: boolean;
}

// tslint:disable-next-line:no-default-export
export default function transformer(program: ts.Program, config?: Partial<PluginConfig>): ts.TransformerFactory<ts.SourceFile> {
	const minifier = new PropertiesMinifier({ emitOriginalName: true, ...config });
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => minifier.visitSourceFile(file, program, context);
}
