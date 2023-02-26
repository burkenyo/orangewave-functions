import * as fs from "node:fs/promises";
import { type AugmentedFunction, wrap } from "../utils.mjs";

interface GitInfoDto {
  readonly branch: string,
  readonly commit: string,
  readonly isDirty: boolean
}

let gitInfo: GitInfoDto;

const httpTrigger: AugmentedFunction<null> = async function (): Promise<GitInfoDto> {
  if (!gitInfo) {
    gitInfo = JSON.parse(await (fs.readFile("git-info.json", { encoding: "utf-8" })));
  }

  return gitInfo;
}

export default wrap(httpTrigger, false);
