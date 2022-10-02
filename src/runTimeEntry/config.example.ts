const PROJECTS = [
  { projectId: 1234567, projectName: "projectId_1" },
  { projectId: 7654321, projectName: "projectId_2" },
] as const;

type TimeEntry = typeof PROJECTS[number] & { description: string };

// eslint-disable-next-line import/prefer-default-export
export const TIME_ENTRIES: readonly TimeEntry[] = [
  { projectId: 1234567, projectName: "projectId_1", description: "desc_p1_1" },
  { projectId: 1234567, projectName: "projectId_1", description: "desc_p1_2" },

  { projectId: 7654321, projectName: "projectId_2", description: "desc_p2_1" },
  { projectId: 7654321, projectName: "projectId_2", description: "desc_p2_2" },
] as const;
