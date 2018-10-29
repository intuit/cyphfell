const FunctionCallStack = require("./src/FunctionCallStack");

module.exports = () => {
	global.cyphfellCallStack = FunctionCallStack;
};