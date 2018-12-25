#!/usr/bin/env node
const options = require("./cliOptions"),
	conversion = require("./index");
conversion(options, []);
