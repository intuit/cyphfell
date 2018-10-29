const converter = require("../src/converters/ActiveConverter");
const fs = require("fs");
converter.init(process.argv[2]);

const contents = fs.readFileSync(process.argv[3], "utf8");
fs.writeFileSync(process.argv[3], `${contents} \n ${converter.getStrategy().getSupportAppendText()}`);
fs.writeFileSync(process.argv[4], converter.getStrategy().getCommandsFileContents());