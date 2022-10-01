/* eslint-disable camelcase */

export interface TimeEntry {
  time: number;
  title: { time_entry: string };
  local_start: string;
}

interface Project {
  id: number;
  time: number;
  title: { project: string };
  items: TimeEntry[];
}

export interface SummaryResponse {
  total_grand: number;
  data: Project[];
}
