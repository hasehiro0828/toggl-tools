import { NAME_TO_ALIAS_MAP } from "@/constants";
import { Project } from "@/model";

export const convertDurationToSeconds = (duration: string): number => {
  const [hours, minutes, seconds] = duration.split(":").map((str) => parseInt(str, 10));
  return hours * 3600 + minutes * 60 + seconds;
};
export const convertSecondsToDuration = (_seconds: number): string => {
  const zeroPadding = (num: number): string => `00${num}`.slice(-2);

  const hours = Math.floor(_seconds / 3600);
  const minutes = Math.floor((_seconds % 3600) / 60);
  const seconds = _seconds % 60;

  return `${zeroPadding(hours)}:${zeroPadding(minutes)}:${zeroPadding(seconds)}`;
};

export const createTextFromProject = (project: Project, totalSeconds: number): string => {
  const getPercentageText = (seconds: number): string => `${((seconds / totalSeconds) * 100).toFixed(0)}%`;

  const alias = NAME_TO_ALIAS_MAP.get(project.name);
  const title = typeof alias !== "undefined" ? `${alias}(${project.name})` : project.name;

  let text = `- ${getPercentageText(project.durationSeconds)} [${convertSecondsToDuration(
    project.durationSeconds
  )}] ${title}\n`;
  project.timeEntries.forEach((timeEntry) => {
    text += `  - ${getPercentageText(timeEntry.durationSeconds)} [${convertSecondsToDuration(
      timeEntry.durationSeconds
    )}] ${timeEntry.name}\n`;
  });

  return text;
};
