import * as ts from 'typescript';

// decorators and modifiers-related api added in ts 4.8
interface BreakingTypeScriptApi {
	canHaveDecorators(node: ts.Node): boolean;
	getDecorators(node: ts.Node): readonly ts.Decorator[] | undefined;
	canHaveModifiers(node: ts.Node): boolean;
	getModifiers(node: ts.Node): readonly ts.Modifier[] | undefined;
}

export const enum GenerateNameStrategy {
	PrependPrefixOnly = 'prependPrefixOnly',
	Random = 'random',
	RandomStable = 'randomStable',
}

export interface PropertyMinifierOptions {
	/**
	 * Prefix of generated names (e.g. '__private__')
	 */
	prefix: string;
}

const defaultOptions: PropertyMinifierOptions = {
	prefix: '_private_',
};

type NodeCreator<T extends ts.Node> = (newName: string) => T;

export class PropertiesMinifier {
	private readonly options: PropertyMinifierOptions;

	public constructor(options?: Partial<PropertyMinifierOptions>) {
		this.options = { ...defaultOptions, ...options };
	}

	public visitSourceFile(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile {
		const result = this.visitNodeAndChildren(node, program, context);
		return result;
	}

	private visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
	private visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;
	private visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
		return ts.visitEachChild(
			this.visitNode(node, program),
			(childNode: ts.Node) => this.visitNodeAndChildren(childNode, program, context),
			context
		);
	}

	private visitNode(node: ts.Node, program: ts.Program): ts.Node {
		if (isAccessExpression(node)) {
			return this.createNewAccessExpression(node, program);
		} else if (ts.isBindingElement(node)) {
			return this.createNewBindingElement(node, program);
		} else if (isConstructorParameterReference(node, program)) {
			return this.createNewNode(program, node, ts.createIdentifier);
		}

		return node;
	}

	private createNewAccessExpression(node: AccessExpression, program: ts.Program): AccessExpression {
		const typeChecker = program.getTypeChecker();

		const accessName = ts.isPropertyAccessExpression(node) ? node.name : node.argumentExpression;
		const symbol = typeChecker.getSymbolAtLocation(accessName);

		if (!isPrivateNonStaticClassMember(symbol)) {
			return node;
		}

		let propName: ts.PropertyName;
		let creator: NodeCreator<AccessExpression>;

		if (ts.isPropertyAccessExpression(node)) {
			propName = node.name;
			creator = (newName: string) => {
				return ts.createPropertyAccess(node.expression, newName);
			};
		} else {
			if (!ts.isStringLiteral(node.argumentExpression)) {
				return node;
			}

			propName = node.argumentExpression;
			creator = (newName: string) => {
				return ts.createElementAccess(node.expression, ts.createStringLiteral(newName));
			};
		}

		return this.createNewNode(program, propName, creator);
	}

	private createNewBindingElement(node: ts.BindingElement, program: ts.Program): ts.BindingElement {
		const typeChecker = program.getTypeChecker();

		let propName: ts.PropertyName;
		let symbol: ts.Symbol | undefined;

		if (node.propertyName === undefined) {
			// if no property name is set (const { a } = foo)
			// then node.propertyName is undefined and we need to find this property by yourself
			// so let's use go-to-definition algorithm from TSServer
			// see https://github.com/microsoft/TypeScript/blob/672b0e3e16ad18b422dbe0cec5a98fce49881b76/src/services/goToDefinition.ts#L58-L77
			if (!ts.isObjectBindingPattern(node.parent as ts.Node)) {
				return node;
			}

			const type = typeChecker.getTypeAtLocation(node.parent as ts.Node);
			if (type.isUnion()) {
				return node;
			}

			if (!ts.isIdentifier(node.name)) {
				return node;
			}

			propName = node.name;
			symbol = type.getProperty(ts.idText(propName));
		} else {
			propName = node.propertyName;
			symbol = typeChecker.getSymbolAtLocation(node.propertyName);
		}

		if (!isPrivateNonStaticClassMember(symbol)) {
			return node;
		}

		return this.createNewNode(program, propName, (newName: string) => {
			return ts.createBindingElement(node.dotDotDotToken, newName, node.name, node.initializer);
		});
	}

	private createNewNode<T extends ts.Node>(program: ts.Program, oldProperty: ts.PropertyName, createNode: NodeCreator<T>): T {
		const typeChecker = program.getTypeChecker();
		const symbol = typeChecker.getSymbolAtLocation(oldProperty);
		if (symbol === undefined) {
			throw new Error(`Cannot get symbol for node "${oldProperty.getText()}"`);
		}

		const oldPropertyName = symbol.escapedName as string;

		const newPropertyName = this.getNewName(oldPropertyName);
		const newProperty = createNode(newPropertyName);

		return newProperty;
	}

	private getNewName(originalName: string): string {
		return `${this.options.prefix}${originalName}`;
	}
}

function isPrivateNonStatic(node: ClassMember | ts.ParameterDeclaration): boolean {
	return hasPrivateKeyword(node) && !hasModifier(node, ts.SyntaxKind.StaticKeyword);
}

function hasPrivateKeyword(node: ClassMember | ts.ParameterDeclaration): boolean {
	return hasModifier(node, ts.SyntaxKind.PrivateKeyword);
}

function hasModifier(node: ts.Node, modifier: ts.SyntaxKind): boolean {
	const modifiers = getModifiers(node);

	return modifiers !== undefined && modifiers.some((mod: ts.Modifier) => mod.kind === modifier);
}

type AccessExpression = ts.PropertyAccessExpression | ts.ElementAccessExpression;

function isAccessExpression(node: ts.Node): node is AccessExpression {
	return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
}

type ClassMember = ts.MethodDeclaration | ts.PropertyDeclaration;

function isClassMember(node: ts.Node): node is ClassMember {
	return ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node);
}

function isConstructorParameter(node: ts.Node): node is ts.ParameterDeclaration {
	return ts.isParameter(node) && ts.isConstructorDeclaration(node.parent as ts.Node);
}

function isConstructorParameterReference(node: ts.Node, program: ts.Program): node is ts.Identifier {
	if (!ts.isIdentifier(node)) {
		return false;
	}

	const typeChecker = program.getTypeChecker();
	const symbol = typeChecker.getSymbolAtLocation(node);
	return isPrivateNonStaticClassMember(symbol);
}

function isPrivateNonStaticClassMember(symbol: ts.Symbol | undefined): boolean {
	// for some reason ts.Symbol.declarations can be undefined (for example in order to accessing to proto member)
	if (symbol === undefined || symbol.declarations === undefined) { // tslint:disable-line:strict-type-predicates
		return false;
	}

	return symbol.declarations.some((x: ts.Declaration) => {
		// terser / uglify property minifiers aren't able to handle decorators
		return (isClassMember(x) && !hasDecorators(x) || isConstructorParameter(x)) && isPrivateNonStatic(x);
	});
}

function hasDecorators(node: ts.Node): boolean {
	return isBreakingTypeScriptApi(ts) ?
		ts.canHaveDecorators(node) && !!ts.getDecorators(node) :
		!!node.decorators;
}

function getModifiers(node: ts.Node): ts.NodeArray<ts.Modifier> | readonly ts.Modifier[] | undefined {
	return isBreakingTypeScriptApi(ts) ?
		ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined :
		node.modifiers as ts.NodeArray<ts.Modifier>;
}

function isBreakingTypeScriptApi(compiler: unknown): compiler is BreakingTypeScriptApi {
	return 'canHaveDecorators' in ts;
}
