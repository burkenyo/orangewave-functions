export interface Config {
  readonly letsEncrypt: {
    readonly accountUrl: string,
    readonly accountKey: string,
  }
  readonly ionos: {
    readonly apiKey: string
  }
  readonly zones: readonly string[];
}
