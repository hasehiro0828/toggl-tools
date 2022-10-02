import * as fs from "fs";

import { config } from "dotenv";

import Api from "@/common/api";
import {
  API_TOKEN,
  GROUP_SETTINGS,
  IGNORE_PROJECT_NAMES_ON_CHECKING_STATUS,
  RESULTS_DIR_ABSOLUTE_PATH,
  WORKSPACE_ID,
} from "@/makeSummary/config";
import {
  getMondayOfLastWeek,
  convertDateToString,
  _convertMsToSpendTime,
  createTimeText,
  getTimeEntryTextWithStatus,
} from "@/makeSummary/utils";

config();

const main = async (): Promise<void> => {
  const api = new Api(WORKSPACE_ID, API_TOKEN);

  const since = getMondayOfLastWeek(new Date());
  const _until = new Date(since); // eslint-disable-line no-underscore-dangle
  _until.setDate(_until.getDate() + 6);
  const until = _until;

  const summary = await api.getSummary(convertDateToString(since), convertDateToString(until));

  let textWithTime = `Total Time: ${_convertMsToSpendTime(summary.total_grand)}\n\n`;
  let textWithoutTime = "";

  const projectNamesOfGroupSettings = Object.values(GROUP_SETTINGS).flat();
  const devProjects = summary.data.filter((project) => !projectNamesOfGroupSettings.includes(project.title.project));

  const sumOfProjects = devProjects.map((project) => project.time).reduce((sum, elm) => sum + elm, 0);
  textWithTime += `## 開発系 の合計時間: ${createTimeText(sumOfProjects, summary.total_grand)}\n`;
  textWithoutTime += "\n";

  // eslint-disable-next-line no-restricted-syntax
  for (const project of devProjects) {
    textWithTime += `- ${createTimeText(project.time, summary.total_grand)} ${project.title.project}\n`;
    textWithoutTime += `- ${project.title.project}\n`;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of project.items) {
      const text = IGNORE_PROJECT_NAMES_ON_CHECKING_STATUS.includes(project.title.project)
        ? item.title.time_entry
        : await getTimeEntryTextWithStatus(item); // eslint-disable-line no-await-in-loop
      textWithTime += `  - ${createTimeText(item.time, summary.total_grand)} ${text}\n`;
      textWithoutTime += `  - ${text}\n`;
    }
  }
  textWithTime += "\n---\n";
  textWithoutTime += "\n---\n\n";

  // eslint-disable-next-line no-restricted-syntax
  for (const [groupName, projectNames] of Object.entries(GROUP_SETTINGS)) {
    const projects = summary.data.filter((project) => projectNames.includes(project.title.project));
    const sumOfGroup = projects.map((project) => project.time).reduce((sum, elm) => sum + elm, 0);

    textWithTime += `## ${groupName} の合計時間: ${createTimeText(sumOfGroup, summary.total_grand)}\n`;
    textWithoutTime += ``;

    // eslint-disable-next-line no-restricted-syntax
    for (const project of projects) {
      textWithTime += `- ${createTimeText(project.time, summary.total_grand)} ${project.title.project}\n`;
      textWithoutTime += `- ${project.title.project}\n`;
      // eslint-disable-next-line no-restricted-syntax
      for (const item of project.items) {
        // eslint-disable-next-line no-await-in-loop
        textWithTime += `  - ${createTimeText(item.time, summary.total_grand)} ${item.title.time_entry}\n`;
        textWithoutTime += `  - ${item.title.time_entry}\n`;
      }
    }
  }

  let resultText = "";
  resultText += `${convertDateToString(since)} ~ ${convertDateToString(until)}\n`;
  resultText += `${textWithTime}`;
  resultText += "\n------------\n\n";
  resultText += `${textWithoutTime}`;

  const resultsDirPath = RESULTS_DIR_ABSOLUTE_PATH;

  const filePath = `${resultsDirPath}/${convertDateToString(since)}_${convertDateToString(until)}.md`;
  if (!fs.existsSync(resultsDirPath)) {
    fs.mkdirSync(resultsDirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, resultText);

  // eslint-disable-next-line no-console
  console.log(`🎉結果を保存しました🎉: ${filePath}`);
};

main();
