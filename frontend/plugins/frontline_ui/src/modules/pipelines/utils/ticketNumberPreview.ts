const NUMBER_CONFIG_TOKENS: [RegExp, (now: Date) => string][] = [
  [/\{year\}/g, (now) => now.getFullYear().toString()],
  [/\{month\}/g, (now) => `0${now.getMonth() + 1}`.slice(-2)],
  [/\{day\}/g, (now) => `0${now.getDate()}`.slice(-2)],
];

export const MIN_TICKET_NUMBER_SIZE = 1;
export const MAX_TICKET_NUMBER_SIZE = 8;

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

  const size = Number.parseInt(numberSize, 10);

  if (
    Number.isNaN(size) ||
    size < MIN_TICKET_NUMBER_SIZE ||
    size > MAX_TICKET_NUMBER_SIZE
  ) {
    return null;
  }

  const prefix = NUMBER_CONFIG_TOKENS.reduce(
    (config, [token, resolve]) => config.replace(token, resolve(now)),
    numberConfig ?? '',
  );

  return { prefix, sequence: '0'.repeat(size) };
};
