import core from "@actions/core";
import * as utils from "./utils.mjs";

const ENV_VAR_NAME = "AZURE_APP_SERVICE_SLOT_NAME"

const gitInfo = await utils.getGitInfo();
const slotName = gitInfo.branch == "prime" ? null : gitInfo.branch;

if (slotName) {
  console.log(`Exporting ${ENV_VAR_NAME} = ${slotName} ...`);
} else {
  console.log(`Exporting empty ${ENV_VAR_NAME} ...`);
}
core.exportVariable(ENV_VAR_NAME, slotName);
