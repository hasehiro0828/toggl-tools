/* eslint-disable no-unused-vars */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_TOKEN: string;
    readonly WORKSPACE_ID: string;
    readonly RESULTS_DIR_ABSOLUTE_PATH: string;
  }
}
