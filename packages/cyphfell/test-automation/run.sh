#!/usr/bin/env bash

copy_support_file() {
    cp ./defaultFiles/defaultSupportFile.js ./test-automation/cypress/support/index.js
    # replace the package name because that should only be used for modules that are dependent upon this one
    export TESTING_LOCALLY=true
    node ./test-automation/initSupport.js wdio test-automation/cypress/support/index.js test-automation/cypress/support/frameworkCommands.js
    sed -i '' -e 's/cyphfell/\.\.\/\.\.\/\.\./g' test-automation/cypress/support/index.js
}

# TODO: consider using set -e instead of this method
check_for_failures() {
    if [ -e test-automation/cypress/screenshots ] || [ -e test-automation/automationErrors.log ]
    then
        echo "An uncaught error was encountered during automation testing"
        exit 1
    fi
}

if [ -e test-automation/cypress/screenshots ]
then
    rm -r test-automation/cypress/screenshots
fi

if [ -e test-automation/automationErrors.log ]
then
    rm test-automation/automationErrors.log
fi

# copy the necessary files for running automation
cp ./defaultFiles/defaultPluginFile.js ./test-automation/cypress/plugins/index.js
cp ./defaultFiles/defaultCommandsFile.js ./test-automation/cypress/support/commands.js
sed -i '' -e 's/cyphfell/\.\.\/\.\.\/\.\./g' test-automation/cypress/support/commands.js
copy_support_file

# run automation
# TODO: potentially use github static page instead of starting a local server
yarn start &
sleep 7

cypress run -b chrome --spec "**/*/!(DataCaptureHookTests).spec.js"
check_for_failures

cat test-automation/wdioConfigInitData.js >> test-automation/cypress/support/index.js
cypress run -b chrome --spec **/*/DataCaptureHookTests.spec.js
check_for_failures