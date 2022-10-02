import { prompt } from "enquirer";

import Api from "@/common/api";
import { API_TOKEN, WORKSPACE_ID } from "@/common/config";
import { TIME_ENTRIES } from "@/runTimeEntry/config";

const getSelectedTimeEntry = async (): Promise<typeof TIME_ENTRIES[number]> => {
  const choices = TIME_ENTRIES.map((timeEntry) => ({
    name: `${timeEntry.projectName}: ${timeEntry.description}`,
    data: timeEntry,
  }));

  const options = {
    type: "select",
    name: "value",
    message: `どの TimeEntry を start しますか？`,
    choices,
  } as const;
  const answerName: Record<typeof options["name"], string> = await prompt(options);
  const answerChoice = choices.find((choice) => choice.name === answerName.value)!;

  return answerChoice.data;
};

const main = async (): Promise<void> => {
  const api = new Api(WORKSPACE_ID, API_TOKEN);

  const selectedTimeEntry = await getSelectedTimeEntry();

  await api.runTimeEntry(selectedTimeEntry.description, selectedTimeEntry.projectId.toString());
};

main();
