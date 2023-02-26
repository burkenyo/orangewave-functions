// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

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

export type AugmentedFunction<TConfig extends object | null> =
  (context: Context, config: TConfig, azureCredential: TokenCredential, ...args: any[]) => Promise<unknown> | void;

// the type checker will ensure all AugmentedFunctions with a non-null config type parameter
// are called with takesConfig = true
export function wrap<TConfig extends object>(fn: AugmentedFunction<TConfig>, takesConfig: true): AzureFunction;
// the type checker will ensure all AugmentedFunctions with a null config type parameter
// are called with takesConfig = false
export function wrap(fn: AugmentedFunction<null>, takesConfig: false): AzureFunction;
export function wrap<TConfig extends object | null>(fn: AugmentedFunction<TConfig>, takesConfig: boolean): AzureFunction
{
  return async (baseContext: BaseContext, ...args: any[]) => {
    try {
      const context = augmentContext(baseContext);
      const azureCredential = new DefaultAzureCredential();

      const config = takesConfig? await getConfig(context, azureCredential) : null;

      const result = await fn(context, config as TConfig, azureCredential, args);

      setResult(baseContext, result);
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

async function getConfig(context: Context, azureCredential: TokenCredential): Promise<unknown> {
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

  return JSON.parse(configSecret.value);
}

function setResult(context: BaseContext, result: unknown): void {
  if (!result) {
    return;
  }

  context.res = { body: result };

  if (context.bindingDefinitions.some(b => b.direction == "out" && b.type == "http")) {
    const contentType = typeof result == "string" ? "text/plain" : "application/json";

    context.res.headers = { "Content-Type": contentType };
  }
}
