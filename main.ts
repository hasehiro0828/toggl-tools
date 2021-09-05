/* eslint-disable no-console */
import clipboardy from "clipboardy";
import { prompt } from "enquirer";

import { UNIMPORTANT_PROJECTS } from "@/constants";
import { convertSecondsToDuration, createTextFromProject, getProjectsFromCsv } from "@/utils";

const { projects: projectArray, filePath } = getProjectsFromCsv();

const main = async (): Promise<void> => {
  const totalSeconds = projectArray.map((project) => project.durationSeconds).reduce((sum, elm) => sum + elm);

  const unimportantProjects = projectArray.filter((project) => UNIMPORTANT_PROJECTS.includes(project.name));
  const importantProjects = projectArray.filter((project) => !UNIMPORTANT_PROJECTS.includes(project.name));

  const includesTime: { value: boolean } = await prompt({
    type: "confirm",
    name: "value",
    message: "時間を含めますか?",
  });

  const allTimeEntries = importantProjects.map((project) => project.timeEntries).flat();

  const timeEntryNameToStatusMap = new Map<string, string>();
  // eslint-disable-next-line no-restricted-syntax
  for await (const timeEntry of allTimeEntries) {
    const status: { value: string } = await prompt({
      type: "select",
      name: "value",
      message: `「${timeEntry.name}」の状態は？`,
      choices: ["WIP", "レビュー中", "修正中", "ステージング確認中", "本番反映済み"],
    });

    timeEntryNameToStatusMap.set(timeEntry.name, status.value);
  }

  let text = `Total Time: ${convertSecondsToDuration(totalSeconds)}\n\n`;
  importantProjects.forEach((project) => {
    text += createTextFromProject(project, totalSeconds, includesTime.value, timeEntryNameToStatusMap);
  });

  text += "\n---\n\n";

  unimportantProjects.forEach((project) => {
    text += createTextFromProject(project, totalSeconds, includesTime.value, timeEntryNameToStatusMap);
  });

  console.log(filePath);
  console.log(text);
  console.log("🎉クリップボードにコピーしました🎉");
  clipboardy.writeSync(text);
};

main();
