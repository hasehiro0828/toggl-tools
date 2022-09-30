/* eslint-disable no-console */
import * as fs from "fs";

import { GROUP_SETTINGS } from "@/csv2text/constants";
import {
  convertSecondsToDuration,
  createTextFromProject,
  createTextOfTotalTimeOfProjects,
  getProjectsFromCsv,
  getTimeEntryNameToStatusMap,
} from "@/csv2text/utils";

const GROUP_PROJECT_MAP = new Map<string, string>(
  Object.entries(GROUP_SETTINGS).flatMap(([group, names]) => names.map((name) => [name, group]))
);

const { projects: projectArray, filePath } = getProjectsFromCsv();

const main = async (): Promise<void> => {
  const otherProjects = projectArray.filter((project) => typeof GROUP_PROJECT_MAP.get(project.name) !== "undefined");
  const devProjects = projectArray.filter((project) => typeof GROUP_PROJECT_MAP.get(project.name) === "undefined");

  const timeEntryNameToStatusMap = await getTimeEntryNameToStatusMap(
    devProjects.filter((project) => project.name !== "DevGeneral")
  );

  const totalSeconds = projectArray.map((project) => project.durationSeconds).reduce((sum, elm) => sum + elm);
  let textWithTime = `Total Time: ${convertSecondsToDuration(totalSeconds)}\n\n`;
  let textWithoutTime = "";

  textWithTime += `## 開発系 の合計時間: ${createTextOfTotalTimeOfProjects(devProjects, totalSeconds)}\n`;

  devProjects.forEach((project) => {
    textWithTime += createTextFromProject(project, totalSeconds, true, timeEntryNameToStatusMap);
    textWithoutTime += createTextFromProject(project, totalSeconds, false, timeEntryNameToStatusMap);
  });

  textWithTime += "\n---\n\n";
  textWithoutTime += "\n---\n\n";

  Object.entries(GROUP_SETTINGS).forEach(([groupName, names]) => {
    const projects = otherProjects.filter((project) => names.includes(project.name));

    textWithTime += `## ${groupName} の合計時間: ${createTextOfTotalTimeOfProjects(projects, totalSeconds)}\n`;

    projects.forEach((project) => {
      textWithTime += createTextFromProject(project, totalSeconds, true, timeEntryNameToStatusMap);
      textWithoutTime += createTextFromProject(project, totalSeconds, false, timeEntryNameToStatusMap);
    });
  });

  const resultText = `${textWithTime}\n--------------\n\n${textWithoutTime}`;
  const resultTextFileName = filePath.replace("./csv/Toggl_Track_summary_report_", "").replace(".csv", "");

  if (!fs.existsSync("results")) {
    fs.mkdirSync("results");
  }
  fs.writeFileSync(`results/${resultTextFileName}.md`, resultText);

  console.log("--------------------------------------------");
  console.log(filePath);
  console.log("🎉結果を保存しました🎉");
};

main();
