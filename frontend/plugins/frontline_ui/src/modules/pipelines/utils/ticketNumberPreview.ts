const NUMBER_CONFIG_TOKENS: [RegExp, (now: Date) => string][] = [
  [/\{year\}/g, (now) => now.getFullYear().toString()],
  [/\{month\}/g, (now) => `0${now.getMonth() + 1}`.slice(-2)],
  [/\{day\}/g, (now) => `0${now.getDate()}`.slice(-2)],
];

export type TTicketNumberPreview = {
  prefix: string;
  sequence: string;
};

// Mirrors `generateTicketNumber` in `frontline_api`: no fractional part means
// the pipeline does not number its tickets at all.
export const buildTicketNumberPreview = (
  numberConfig: string | undefined,
  numberSize: string | undefined,
  now: Date = new Date(),
): TTicketNumberPreview | null => {
  if (!numberSize) return null;

  const size = parseInt(numberSize, 10);
  const width = Number.isNaN(size) || size < 1 ? 1 : size;

  const prefix = NUMBER_CONFIG_TOKENS.reduce(
    (config, [token, resolve]) => config.replace(token, resolve(now)),
    numberConfig ?? '',
  );

  return { prefix, sequence: '0'.repeat(width) };
};
