deps:
	yarn

run/csv2text: deps
	yarn ts-node -r tsconfig-paths/register src/csv2text/main.ts