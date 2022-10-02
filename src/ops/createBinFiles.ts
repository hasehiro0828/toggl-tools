import { execSync } from "child_process";
import * as fs from "fs";
import path from "path";

const BIN_DIR_PATH = path.resolve(`${__dirname}/../../bin`);
const DIST_DIR_PATH = path.resolve(`${__dirname}/../../dist`);

const getNodePath = (): string | undefined => {
  const versions = execSync("nodenv versions --bare").toString().split("\n");

  if (!versions.some((version) => version.startsWith("18"))) {
    console.log("node v18 以上をインストールしてください"); // eslint-disable-line no-console
    return undefined;
  }

  const v18versions = versions.filter((version) => version.startsWith("18"));
  const sortedVersions = v18versions.sort((a, b) => (a > b ? 1 : -1));
  const latestVersion = sortedVersions[0];

  const nodenvPath = execSync("nodenv root").toString().trim();

  const nodeFilePath = `${nodenvPath}/versions/${latestVersion}/bin/node`;

  return nodeFilePath;
};

const getInDistFilePaths = (dirPath: string): string[] => {
  const files = fs.readdirSync(dirPath);
  const inDistFilePaths = files
    .map((file) => `${dirPath}/${file}`)
    .filter((filePath) => {
      const stat = fs.statSync(filePath);
      return stat.isFile();
    });

  return inDistFilePaths;
};

const createBinFile = (filePath: string, shebang: string): void => {
  const fileContent = fs.readFileSync(filePath).toString();
  const binFileContent = `${shebang}\n${fileContent}`;

  if (!fs.existsSync(BIN_DIR_PATH)) {
    fs.mkdirSync(BIN_DIR_PATH);
  }

  const binFilePath = `${BIN_DIR_PATH}/${path.basename(filePath)}`;
  fs.writeFileSync(binFilePath, binFileContent);

  console.log("🎉bin file created: ", binFilePath); // eslint-disable-line no-console
};

const main = (): void => {
  const nodeFilePath = getNodePath();
  if (typeof nodeFilePath === "undefined") {
    return;
  }

  const inDistFilePaths = getInDistFilePaths(DIST_DIR_PATH);

  inDistFilePaths.forEach((filePath) => {
    createBinFile(filePath, `#!${nodeFilePath}`);
  });
};

main();
