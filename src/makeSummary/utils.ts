import { prompt } from "enquirer";

import { TimeEntry } from "@/makeSummary/types";

export const getMondayOfLastWeek = (baseDay: Date): Date => {
  const returnDate = new Date(baseDay);
  const day = baseDay.getDay();
  const diff = baseDay.getDate() - day + (day === 0 ? -6 : 1) - 7;
  returnDate.setDate(diff);
  return returnDate;
};

export const convertDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

export const createTimeText = (ms: number, totalMs: number): string => {
  const percentageText = _convertPercentageText(ms, totalMs);
  const spendTimeText = _convertMsToSpendTime(ms);
  return `${percentageText} [${spendTimeText}]`;
};

export const getTimeEntryTextWithStatus = async (timeEntry: TimeEntry): Promise<string> => {
  const status: { value: string } = await prompt({
    type: "select",
    name: "value",
    message: `「${timeEntry.title.time_entry}」の状態は？`,
    choices: ["WIP", "レビュー中", "修正中", "ステージング確認中", "本番反映済み", "DONE"],
  });

  return `【${status.value}】 ${timeEntry.title.time_entry}`;
};

// eslint-disable-next-line no-underscore-dangle
export const _convertMsToSpendTime = (ms: number): string => {
  const zeroPadding = (num: number): string => num.toString().padStart(2, "0");

  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${zeroPadding(hours)}:${zeroPadding(minutes)}:${zeroPadding(seconds)}`;
};

// eslint-disable-next-line no-underscore-dangle
export const _convertPercentageText = (ms: number, totalMs: number): string => {
  const percentage = ((ms / totalMs) * 100).toFixed(0);
  return `${percentage}%`;
};
