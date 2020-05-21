# sudo cnpm install -g prettier

.PHONY: fmt

fmt:
	find . -name "*.js" | xargs -I {} prettier --write {}
