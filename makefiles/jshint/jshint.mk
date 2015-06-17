JSHINT_FILES = $(shell find test app -name '*.js' -or -name '*.json' | sort)

jshint:
	@jshint -c makefiles/jshint/jshintrc.json $(JSHINT_FILES) *.js
