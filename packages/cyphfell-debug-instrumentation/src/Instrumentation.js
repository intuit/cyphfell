export default function({types: t}) {
	return {
		visitor: {
			FunctionDeclaration(path) {
				console.error(path);
			}
		}
	};
}