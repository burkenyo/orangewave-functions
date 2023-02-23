import { AzureFunction, Context as BaseContext } from "@azure/functions";
import { DefaultAzureCredential, TokenCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export interface Logger {
    (msg: string): void;
}

export interface Context extends BaseContext {
  environment: {
    name: string;
    isDevelopment: boolean;
    isLocal: boolean;
  }
}

export type AugmentedFunction<TConfig extends object> =
  (context: Context, config: TConfig, azureCredential: TokenCredential, ...args: any[]) => Promise<any> | void;

export function wrap<TConfig extends object>(fn: AugmentedFunction<TConfig>): AzureFunction
{
  return async (baseContext: BaseContext, ...args: any[]) => {
    try {
      const context = augmentContext(baseContext);
      const azureCredential = new DefaultAzureCredential();
      const config = await getConfig<TConfig>(context, azureCredential);

      const result = fn(context, config, azureCredential, args);
      baseContext.res = context.res;

      return result;
    } catch (ex: any) {
      baseContext.log.error(ex.message ?? ex);
      throw ex;
    }
  };
}

function augmentContext(baseContext: BaseContext): Context {
  const name = process.env.AZURE_FUNCTIONS_ENVIRONMENT
  ?? process.env.APPSETTING_WEBSITE_SLOT_NAME!;

  const context: Context = {
    ...baseContext,
    environment: {
      name,
      isDevelopment: name.toLowerCase().startsWith("dev"),
      isLocal: !!process.env.FUNCTIONS_CORETOOLS_ENVIRONMENT
    }
  }

  return context;
}

async function getConfig<TConfig extends object>(
  context: Context, azureCredential: TokenCredential
): Promise<TConfig> {
  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

  if (!vaultUrl) {
    throw new Error("Env var AZURE_KEY_VAULT_URL not set!");
  }
  const secretClient = new SecretClient(vaultUrl, azureCredential);

  const configSecretName = context.executionContext.functionName
    + "--config" + (context.environment.isDevelopment ? "-dev" : "");

  const configSecret = await secretClient.getSecret(configSecretName)

  if (!configSecret.value) {
    throw new Error(`Config secret ${configSecretName} not defined!`);
  }

  return JSON.parse(configSecret.value) as TConfig;
}
