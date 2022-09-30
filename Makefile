deps:
	yarn

run/csv2text: deps
	yarn ts-node -r tsconfig-paths/register main.ts