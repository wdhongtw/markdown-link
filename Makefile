.PNONY: all clean

all: extionsion.zip

clean:
	$(RM) extionsion.zip

SOURCE = background.js options.html options.css options.js

extionsion.zip: manifest.json README.md images $(SOURCE)
	zip -r $@ $^
