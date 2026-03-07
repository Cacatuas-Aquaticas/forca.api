set NODE_ENV=test
node node_modules/jest/bin/jest.js --verbose --forceExit --runInBand > test_output.txt 2>&1
