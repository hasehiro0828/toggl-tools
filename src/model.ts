export interface TogglCsvJson {
  Project: string;
  Client: string;
  Title: string;
  Duration: string;
}

export interface TimeEntry {
  name: string;
  durationSeconds: number;
}

export interface Project {
  name: string;
  durationSeconds: number;
  timeEntries: TimeEntry[];
}
