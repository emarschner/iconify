export SHELL=./make-env.sh

init:
	npm install

dist-dir:
	@mkdir -p dist

dist: init dist-dir $(shell find src -name *.js)
	browserify src/browser/index.js -t browserify-shim -s iconify > dist/iconify.js

.PHONY: node-test browser-test amd-test test

node-test: init
	mocha tests/*-test.js tests/node

browser-test: init
	karma start tests/browser/karma.conf.js --single-run $(KARMA_FLAGS)

amd-test: init
	karma start tests/amd/karma.conf.js --single-run $(KARMA_FLAGS)

test: amd-test browser-test node-test

.PHONY: node-coverage browser-coverage coverage

node-coverage: init
	istanbul cover node_modules/.bin/_mocha -- tests/*-test.js tests/node

browser-coverage: init
	karma start tests/browser/karma.coverage-conf.js --single-run $(KARMA_FLAGS)

coverage: browser-coverage node-coverage

.PHONY: clean-coverage clean-dist clean-examples clean-package clean

clean-coverage:
	rm -rf coverage/

clean-dist:
	rm -rf dist/

clean-examples:
	cd examples/; make clean

clean-package:
	rm -rf package/ *.tgz

clean: clean-coverage clean-dist clean-examples clean-package
	rm -rf node_modules/

.PHONY: examples

examples: dist
	cd examples/; make
	@serve &> /dev/null & export PID=$$! && echo Examples URL: http://localhost:3000/examples/ && cat && kill $$PID