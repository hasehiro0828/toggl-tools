deps:
	yarn

makeSummary/run: deps
	yarn ts-node --files -r tsconfig-paths/register src/makeSummary/main.ts

test: deps
	yarn test