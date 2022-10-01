deps:
	yarn

csv2text/run: deps
	yarn ts-node -r tsconfig-paths/register src/csv2text/main.ts

makeSummary/run: deps
	yarn ts-node --files -r tsconfig-paths/register src/makeSummary/main.ts

test: deps
	yarn test