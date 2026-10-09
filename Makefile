.PHONY: all build compile clean

all: extension.zip

build: compile manifest.json
	@mkdir -p dist
	cp -R public/. dist/
	cp manifest.json dist/

compile:
	npm run compile

clean:
	$(RM) -r extension.zip dist

extension.zip: build
	$(RM) $@
	cd dist && zip -r ../$@ . -x '*.map'
	zip $@ README.md
