.PHONY: all assets editor static-css

all: assets editor static-css transforms
	@serve &> /dev/null & export PID=$$! && echo Examples URL: http://localhost:3000/ && cat && kill $$PID

assets/jquery.js:
	cp ../node_modules/jquery/dist/jquery.js $@

assets/iconify.js:
	cp ../dist/iconify.js $@

assets: assets/jquery.js assets/iconify.js

editor:
	cd $@; make

static-css:
	cd $@; make

transforms:
	cd $@; make

.PHONY: clean-assets clean-editor clean-static-css clean-transforms clean

clean-assets:
	-rm assets/jquery.js assets/iconify.js

clean-editor:
	cd editor; make clean

clean-static-css:
	cd static-css; make clean

clean-transforms:
	cd transforms; make clean

clean: clean-assets clean-editor clean-static-css