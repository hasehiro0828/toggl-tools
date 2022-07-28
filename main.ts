/* eslint-disable no-console */
import * as fs from "fs";

import { UNIMPORTANT_PROJECTS } from "@/constants";
import {
  convertSecondsToDuration,
  createTextFromProject,
  createTextOfTotalTimeOfProjects,
  getProjectsFromCsv,
  getTimeEntryNameToStatusMap,
} from "@/utils";

const { projects: projectArray, filePath } = getProjectsFromCsv();

const main = async (): Promise<void> => {
  const unimportantProjects = projectArray.filter((project) => UNIMPORTANT_PROJECTS.includes(project.name));
  const importantProjects = projectArray.filter((project) => !UNIMPORTANT_PROJECTS.includes(project.name));

  const timeEntryNameToStatusMap = await getTimeEntryNameToStatusMap(
    importantProjects.filter((project) => project.name !== "General")
  );

  const totalSeconds = projectArray.map((project) => project.durationSeconds).reduce((sum, elm) => sum + elm);
  let textWithTime = `Total Time: ${convertSecondsToDuration(totalSeconds)}\n\n`;
  let textWithoutTime = "";

  textWithTime += `importantProjects の合計時間: ${createTextOfTotalTimeOfProjects(importantProjects, totalSeconds)}\n`;

  importantProjects.forEach((project) => {
    textWithTime += createTextFromProject(project, totalSeconds, true, timeEntryNameToStatusMap);
    textWithoutTime += createTextFromProject(project, totalSeconds, false, timeEntryNameToStatusMap);
  });

  textWithTime += "\n---\n\n";
  textWithoutTime += "\n---\n\n";

  textWithTime += `unimportantProjects の合計時間: ${createTextOfTotalTimeOfProjects(
    unimportantProjects,
    totalSeconds
  )}\n`;

  unimportantProjects.forEach((project) => {
    textWithTime += createTextFromProject(project, totalSeconds, true, timeEntryNameToStatusMap);
    textWithoutTime += createTextFromProject(project, totalSeconds, false, timeEntryNameToStatusMap);
  });

  const resultText = `${textWithTime}\n--------------\n\n${textWithoutTime}`;
  const resultTextFileName = filePath.replace("./csv/Toggl_Track_summary_report_", "").replace(".csv", "");

  if (!fs.existsSync("results")) {
    fs.mkdirSync("results");
  }
  fs.writeFileSync(`results/${resultTextFileName}.txt`, resultText);

  console.log("--------------------------------------------");
  console.log(filePath);
  console.log("🎉結果を保存しました🎉");
};

main();
