PACKAGE_NAME:=$(shell cat package.json | jq .name)

deps:
	yarn

test: deps
	yarn test

run/makeSummary: deps
	yarn ts-node --files -r tsconfig-paths/register src/makeSummary/main.ts

build/makeSummary: deps
	yarn tsc --noEmit
	yarn esbuild src/makeSummary/main.ts --bundle --platform=node --outfile=dist/makeSummary.js

build/all: build/makeSummary

global-install: build/all create-bin-files
	yarn global add file:$(PWD)

global-uninstall:
	yarn global remove $(PACKAGE_NAME)

#==============================================================================
# 以下は普段は使用しない
#==============================================================================
create-bin-files: 
	yarn ts-node --files -r tsconfig-paths/register src/ops/createBinFiles.ts