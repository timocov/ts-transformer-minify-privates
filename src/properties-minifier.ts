import * as ts from 'typescript';

export const enum GenerateNameStrategy {
	PrependPrefixOnly = 'prependPrefixOnly',
	Random = 'random',
	RandomStable = 'randomStable',
}

export interface PropertyMinifierOptions {
	/**
	 * Prefix of generated names (to generate 100% unique names, e.g. '_' or '$')
	 */
	prefix: string;

	/**
	 * Strategy of generating names
	 */
	strategy: GenerateNameStrategy;

	/**
	 * Enable this option to print original name after renamed one (useful for debug purposes)
	 */
	emitOriginalName: boolean;
}

const defaultOptions: PropertyMinifierOptions = {
	prefix: '_',

	strategy: GenerateNameStrategy.Random,

	emitOriginalName: false,
};

type NodeCreator<T extends ts.Node> = (newName: string) => T;

export class PropertiesMinifier {
	private readonly namesCache: Map<string, string> = new Map();
	private readonly usedNames: Set<string> = new Set();

	private currentIndex: number = 0;

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
		if (isClassMember(node) && isPrivateNonStaticMember(node)) {
			return this.createNewClassMember(node, program);
		} else if (isAccessExpression(node)) { // tslint:disable-line:unnecessary-else
			return this.createNewAccessExpression(node, program);
		}

		return node;
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

		// for some reason ts.Symbol.declarations can be undefined (for example in order to accessing to proto member)
		if (symbol === undefined || symbol.declarations === undefined) { // tslint:disable-line:strict-type-predicates
			return node;
		}

		if (!symbol.declarations.some((x: ts.Declaration) => isClassMember(x) && isPrivateNonStaticMember(x))) {
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
			// don't minify numeric private fields
			if (ts.isNumericLiteral(node.argumentExpression)) {
				return node;
			}

			if (!ts.isStringLiteral(node.argumentExpression)) {
				// it's access for private class' member - maybe need to warn here?
				throw new Error(`Cannot minify accessing for ${node.argumentExpression.getText()} property`);
			}

			propName = node.argumentExpression;
			creator = (newName: string) => {
				return ts.createElementAccess(node.expression, ts.createStringLiteral(newName));
			};
		}

		return this.createNewNode(program, propName, creator);
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

		return this.options.emitOriginalName
			? ts.addSyntheticTrailingComment(newProperty, ts.SyntaxKind.MultiLineCommentTrivia, oldPropertyName)
			: newProperty;
	}

	private getNewName(originalName: string): string {
		if (this.options.strategy === GenerateNameStrategy.PrependPrefixOnly) {
			return `${this.options.prefix}${originalName}`;
		}

		let result = this.namesCache.get(originalName);
		if (result === undefined) {
			result = `${this.options.prefix}${this.currentIndex++}`;

			this.usedNames.add(result);
			this.namesCache.set(originalName, result);
		}

		return result;
	}
}

function isPrivateNonStaticMember(node: ClassMember): boolean {
	return hasPrivateKeyword(node) && !hasModifier(node, ts.SyntaxKind.StaticKeyword);
}

function hasPrivateKeyword(node: ClassMember): boolean {
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

function getClassName(classNode: ts.ClassLikeDeclaration): string {
	if (classNode.name === undefined) {
		return 'anonymous class';
	}

	return classNode.name.getText();
}
