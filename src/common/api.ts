import { SummaryResponse } from "@/makeSummary/types";

class Api {
  private readonly workspaceId: string;

  private readonly apiToken: string;

  constructor(workspaceId: string, apiToken: string) {
    this.workspaceId = workspaceId;
    this.apiToken = apiToken;
  }

  getSummary = async (since: string, until: string): Promise<SummaryResponse> => {
    const params = {
      user_agent: `toggl-tools:${this.workspaceId}`,
      workspace_id: this.workspaceId,
      since,
      until,
    };

    const queryParams = new URLSearchParams(params);
    const res = await fetch(`https://api.track.toggl.com/reports/api/v2/summary?${queryParams}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiToken}:api_token`).toString("base64")}`,
      },
    });

    return res.json();
  };

  runTimeEntry = async (description: string, pid: string): Promise<void> => {
    const bodyJson = {
      time_entry: {
        description,
        pid,
        created_with: `toggl-tools:${this.workspaceId}`,
      },
    };
    const res = await fetch("https://api.track.toggl.com/api/v8/time_entries/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.apiToken}:api_token`).toString("base64")}`,
      },
      body: JSON.stringify(bodyJson),
    });

    if (!res.ok) {
      throw new Error(`Failed to run time entry: ${res.statusText}`);
    }

    return res.json();
  };
}

export default Api;
