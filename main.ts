/* eslint-disable no-console */
import fs from "fs";
import { exit } from "process";

import clipboardy from "clipboardy";
import papaparse from "papaparse";

const CSV_DIR_PATH = "./csv";

interface TogglCsvJson {
  Project: string;
  Client: string;
  Title: string;
  Duration: string;
}

interface TimeEntry {
  name: string;
  duration: string;
}

interface Project {
  name: string;
  duration: string;
  timeEntries: TimeEntry[];
}

const convertDurationToSeconds = (duration: string) => {
  const [hours, minutes, seconds] = duration.split(":").map((str) => parseInt(str, 10));
  return hours * 3600 + minutes * 60 + seconds;
};
const convertTotalSecondsToDuration = (totalSeconds: number) => {
  const zeroPadding = (num: number) => `00${num}`.slice(-2);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${zeroPadding(hours)}:${zeroPadding(minutes)}:${zeroPadding(seconds)}`;
};

const direntArray = fs.readdirSync(CSV_DIR_PATH, { withFileTypes: true });
direntArray.sort((a, b) => (a > b ? 1 : -1));
const firstDirent = direntArray.find((dirent) => dirent.isFile());
if (typeof firstDirent === "undefined") {
  console.log("ファイルが見つかりませんでした");
  exit(1);
}

const filePath = `${CSV_DIR_PATH}/${firstDirent.name}`;

const file = fs.readFileSync(filePath);
const parseResult = papaparse.parse(file.toString(), {
  header: true,
  // 最初のヘッダーがシングルクウォートで囲まれるバグの対処
  // https://github.com/mholt/PapaParse/issues/407
  // csvの最初に何か変なもの入ってるのかも
  transformHeader: (header) => header.trim(),
});
const togglJsonArray: TogglCsvJson[] = parseResult.data as TogglCsvJson[];
const filteredTogglJsonArray = togglJsonArray.filter((togglJson) => togglJson.Project !== "");

const projectArray: Project[] = [];
filteredTogglJsonArray.forEach((togglJson) => {
  const timeEntry: TimeEntry = {
    name: togglJson.Title,
    duration: togglJson.Duration,
  };

  const sameProject = projectArray.find((project) => project.name === togglJson.Project);
  if (typeof sameProject === "undefined") {
    projectArray.push({ name: togglJson.Project, duration: togglJson.Duration, timeEntries: [timeEntry] });
  } else {
    const timeEntryTotalSeconds = convertDurationToSeconds(togglJson.Duration);
    const projectTotalSeconds = convertDurationToSeconds(sameProject.duration);
    sameProject.timeEntries.push(timeEntry);
    sameProject.duration = convertTotalSecondsToDuration(timeEntryTotalSeconds + projectTotalSeconds);
  }
});

let text = "";
projectArray.forEach((project) => {
  text += `- [${project.duration}] ${project.name}\n`;
  project.timeEntries.forEach((timeEntry) => {
    text += `  - [${timeEntry.duration}] ${timeEntry.name}\n`;
  });
});

console.log(filePath);
console.log("🎉クリップボードにコピーしました🎉");
clipboardy.writeSync(text);
