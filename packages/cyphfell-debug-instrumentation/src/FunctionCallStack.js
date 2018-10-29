const stack = [];

module.exports = {
	getStack: () => stack,
	emptyStack: () => {
		stack.length = 0;
	},
	push: (filePath, functionName = "&anonymous") => {
		stack.push({
			filePath: filePath,
			functionName: functionName,
			calledLines: []
		});
	},
	callLine: (lineNumber) => {
		stack[stack.length - 1].calledLines.push(lineNumber);
	},
	pop: () => {
		stack.pop();
	},
	printDebugMessage: () => {
		stack.forEach((call) => {
			console.error(`In ${call.filePath}: function: ${call.functionName} was called`);
			console.error(`${call.calledLines[call.calledLines.length - 1]} was the last successfully executed line.`);
		});
	}
};