import fs from "fs";
import { exit } from "process";

import { prompt } from "enquirer";
import papaparse from "papaparse";

import { NAME_TO_ALIAS_MAP } from "@/csv2text/constants";
import { Project, TimeEntry, TogglCsvJson } from "@/csv2text/model";

export const convertDurationToSeconds = (duration: string): number => {
  const [hours, minutes, seconds] = duration.split(":").map((str) => parseInt(str, 10));
  return hours * 3600 + minutes * 60 + seconds;
};

export const convertSecondsToDuration = (_seconds: number): string => {
  const zeroPadding = (num: number): string => (num >= 100 ? `${num}` : `00${num}`.slice(-2));

  const hours = Math.floor(_seconds / 3600);
  const minutes = Math.floor((_seconds % 3600) / 60);
  const seconds = _seconds % 60;

  return `${zeroPadding(hours)}:${zeroPadding(minutes)}:${zeroPadding(seconds)}`;
};

export const createTextOfTotalTimeOfProjects = (projects: Project[], totalSeconds: number): string => {
  const projectsTotalSeconds = projects.map((project) => project.durationSeconds).reduce((sum, elm) => sum + elm);
  const projectsTotalSecondsPercentage = ((projectsTotalSeconds / totalSeconds) * 100).toFixed(0);

  return `${projectsTotalSecondsPercentage}% [${convertSecondsToDuration(projectsTotalSeconds)}]`;
};

export const createTextFromProject = (
  project: Project,
  totalSeconds: number,
  includesTime: boolean,
  timeEntryNameToStatusMap: Map<string, string>
): string => {
  const createStatusText = (timeEntryName: string): string => {
    const status = timeEntryNameToStatusMap.get(timeEntryName);
    if (typeof status === "undefined") return "";

    return `【${status}】`;
  };

  const createTimeText = (seconds: number): string => {
    if (!includesTime) return "";

    const percentageText = `${((seconds / totalSeconds) * 100).toFixed(0)}%`;

    return `${percentageText} [${convertSecondsToDuration(seconds)}] `;
  };

  const alias = NAME_TO_ALIAS_MAP.get(project.name);
  const title = typeof alias !== "undefined" ? `${alias}(${project.name})` : project.name;

  let text = `- ${createTimeText(project.durationSeconds)}${title}\n`;
  project.timeEntries.forEach((timeEntry) => {
    text += `  - ${createTimeText(timeEntry.durationSeconds)}${createStatusText(timeEntry.name)}${timeEntry.name}\n`;
  });

  return text;
};

export const getProjectsFromCsv = (): { projects: Project[]; filePath: string } => {
  const CSV_DIR_PATH = "./csv";

  const direntArray = fs.readdirSync(CSV_DIR_PATH, { withFileTypes: true });
  direntArray.sort((a, b) => (a > b ? 1 : -1));
  const firstDirent = direntArray.find((dirent) => dirent.isFile());
  if (typeof firstDirent === "undefined") {
    // eslint-disable-next-line no-console
    console.error("ファイルが見つかりませんでした");
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
  if (
    parseResult.meta.fields?.some(
      (field) =>
        !["Project", "Client", "Description", "Duration", "Billable duration", "Amount USD", "Amount 円"].includes(
          field
        )
    )
  ) {
    // eslint-disable-next-line no-console
    console.error(`csv のヘッダーが変更されました: ${parseResult.meta.fields}`);
    exit(1);
  }

  const togglJsonArray: TogglCsvJson[] = parseResult.data as TogglCsvJson[];
  const filteredTogglJsonArray = togglJsonArray.filter((togglJson) => togglJson.Project !== "");

  const projectArray: Project[] = [];
  filteredTogglJsonArray.forEach((togglJson) => {
    const timeEntry: TimeEntry = {
      name: togglJson.Description,
      durationSeconds: convertDurationToSeconds(togglJson.Duration),
    };

    const sameProject = projectArray.find((project) => project.name === togglJson.Project);
    if (typeof sameProject === "undefined") {
      projectArray.push({
        name: togglJson.Project,
        durationSeconds: convertDurationToSeconds(togglJson.Duration),
        timeEntries: [timeEntry],
      });
    } else {
      const timeEntryTotalSeconds = convertDurationToSeconds(togglJson.Duration);
      const projectTotalSeconds = sameProject.durationSeconds;
      sameProject.timeEntries.push(timeEntry);
      sameProject.durationSeconds = timeEntryTotalSeconds + projectTotalSeconds;
    }
  });

  return { projects: projectArray, filePath };
};

export const getTimeEntryNameToStatusMap = async (projects: Project[]): Promise<Map<string, string>> => {
  const timeEntriesNeedToChoiceStatus = projects.flatMap((project) => project.timeEntries);

  const timeEntryNameToStatusMap = new Map<string, string>();
  // eslint-disable-next-line no-restricted-syntax
  for await (const timeEntry of timeEntriesNeedToChoiceStatus) {
    const status: { value: string } = await prompt({
      type: "select",
      name: "value",
      message: `「${timeEntry.name}」の状態は？`,
      choices: ["WIP", "レビュー中", "修正中", "ステージング確認中", "本番反映済み", "DONE"],
    });

    timeEntryNameToStatusMap.set(timeEntry.name, status.value);
  }

  return timeEntryNameToStatusMap;
};
