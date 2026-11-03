interface ISavedConfig {
  code: string;
  value: unknown;
}

// every code gets a string, so a field with nothing saved never fails validation as undefined
export const toFormValues = (
  configs: ISavedConfig[],
  codes: readonly string[],
): Record<string, string> => {
  const saved = new Map(configs.map(({ code, value }) => [code, value]));

  return Object.fromEntries(
    codes.map((code) => [code, String(saved.get(code) ?? '')]),
  );
};
