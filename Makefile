.PHONY: all clean

all: extension.zip

clean:
	$(RM) extension.zip

SOURCE = background.js options.html options.css options.js

extension.zip: manifest.json README.md images $(SOURCE)
	zip -r $@ $^
