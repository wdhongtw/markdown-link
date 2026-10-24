.PHONY: all build compile format format-check clean

PRETTIER = npx --yes prettier@3.9.9

all: extension.zip

build: compile manifest.json
	@mkdir -p dist
	cp -R public/. dist/
	cp manifest.json dist/

compile:
	npm run compile

format:
	$(PRETTIER) --write .

format-check:
	$(PRETTIER) --check .

clean:
	$(RM) -r extension.zip dist

extension.zip: build
	$(RM) $@
	cd dist && zip -r ../$@ . -x '*.map'
	zip $@ README.md
