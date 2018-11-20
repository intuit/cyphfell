#!/usr/bin/env bash

export TESTING_LOCALLY=true
export CYPHFELL_TEST_FRAMEWORK=wdio
./node_modules/.bin/mocha "./test/**/*.js"