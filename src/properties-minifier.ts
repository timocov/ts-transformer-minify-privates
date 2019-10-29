import * as ts from 'typescript';

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
		if (isClassMember(node) && isPrivateNonStatic(node)) {
			return this.createNewClassMember(node, program);
		} else if (isAccessExpression(node)) {
			return this.createNewAccessExpression(node, program);
		} else if (ts.isBindingElement(node)) {
			return this.createNewBindingElement(node, program);
		} else if (isConstructorParameterRefernece(node, program)) {
			return this.createNewNode(program, node, ts.createIdentifier);
		} else if (isConstructorParameter(node) && isPrivateNonStatic(node)) {
			return this.createNewConstructorParameter(node, program);
		}

		return node;
	}

	private createNewConstructorParameter(oldParameter: ts.ParameterDeclaration, program: ts.Program): ts.ParameterDeclaration {
		if (!ts.isIdentifier(oldParameter.name)) {
			return oldParameter;
		}

		return this.createNewNode(
			program,
			oldParameter.name,
			(newName: string) => {
				return ts.createParameter(
					oldParameter.decorators,
					oldParameter.modifiers,
					oldParameter.dotDotDotToken,
					newName,
					oldParameter.questionToken,
					oldParameter.type,
					oldParameter.initializer
				);
			}
		);
	}

	private createNewClassMember(oldMember: ClassMember, program: ts.Program): ClassMember {
		let creator: NodeCreator<ClassMember>;

		if (ts.isMethodDeclaration(oldMember)) {
			creator = (newName: string) => {
				return ts.createMethod(
					oldMember.decorators,
					oldMember.modifiers,
					oldMember.asteriskToken,
					newName,
					oldMember.questionToken,
					oldMember.typeParameters,
					oldMember.parameters,
					oldMember.type,
					oldMember.body
				);
			};
		} else {
			// don't minify numeric private fields
			if (ts.isNumericLiteral(oldMember.name)) {
				return oldMember;
			}

			if (!ts.isStringLiteral(oldMember.name) && !ts.isIdentifier(oldMember.name)) {
				throw new Error(`Cannot minify ${getClassName(oldMember.parent)}::${oldMember.name.getText()} property`);
			}

			creator = (newName: string) => {
				return ts.createProperty(
					oldMember.decorators,
					oldMember.modifiers,
					newName,
					oldMember.questionToken || oldMember.exclamationToken,
					oldMember.type,
					oldMember.initializer
				);
			};
		}

		return this.createNewNode(
			program,
			oldMember.name,
			creator
		);
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
	return node.modifiers !== undefined && node.modifiers.some((mod: ts.Modifier) => mod.kind === modifier);
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

function getClassName(classNode: ts.ClassLikeDeclaration): string {
	if (classNode.name === undefined) {
		return 'anonymous class';
	}

	return classNode.name.getText();
}

function isConstructorParameterRefernece(node: ts.Node, program: ts.Program): node is ts.Identifier {
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
		return (isClassMember(x) || isConstructorParameter(x)) && isPrivateNonStatic(x);
	});
}
