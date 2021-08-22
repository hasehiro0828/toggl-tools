/* eslint-disable no-console */
import clipboardy from "clipboardy";

import { UNIMPORTANT_PROJECTS } from "@/constants";
import { convertSecondsToDuration, createTextFromProject, getProjectsFromCsv } from "@/utils";

const { projects: projectArray, filePath } = getProjectsFromCsv();

const totalSeconds = projectArray.map((project) => project.durationSeconds).reduce((sum, elm) => sum + elm);

const unimportantProjects = projectArray.filter((project) => UNIMPORTANT_PROJECTS.includes(project.name));
const importantProjects = projectArray.filter((project) => !UNIMPORTANT_PROJECTS.includes(project.name));

let text = `Total Time: ${convertSecondsToDuration(totalSeconds)}\n\n`;
importantProjects.forEach((project) => {
  text += createTextFromProject(project, totalSeconds);
});

text += "\n---\n\n";

unimportantProjects.forEach((project) => {
  text += createTextFromProject(project, totalSeconds);
});

console.log(filePath);
console.log("🎉クリップボードにコピーしました🎉");
clipboardy.writeSync(text);
