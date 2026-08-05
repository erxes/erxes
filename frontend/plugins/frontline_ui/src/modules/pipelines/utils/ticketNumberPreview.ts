import { format } from 'date-fns';

const NUMBER_CONFIG_TOKENS: [RegExp, string][] = [
  [/\{year\}/g, 'yyyy'],
  [/\{month\}/g, 'MM'],
  [/\{day\}/g, 'dd'],
];

export const MIN_TICKET_NUMBER_SIZE = 1;
export const MAX_TICKET_NUMBER_SIZE = 8;

export type TTicketNumberPreview = {
  prefix: string;
  sequence: string;
};

export const parseTicketNumberSize = (numberSize: string): number | null => {
  if (!/^\d+$/.test(numberSize.trim())) return null;

  const size = Number(numberSize.trim());

  if (size < MIN_TICKET_NUMBER_SIZE || size > MAX_TICKET_NUMBER_SIZE) {
    return null;
  }

  return size;
};

// Mirrors `generateTicketNumber` in `frontline_api`: no fractional part means
// the pipeline does not number its tickets at all.
export const buildTicketNumberPreview = (
  numberConfig: string | undefined,
  numberSize: string | undefined,
  now: Date = new Date(),
): TTicketNumberPreview | null => {
  if (!numberSize) return null;

  const size = parseTicketNumberSize(numberSize);

  if (size === null) return null;

  const prefix = NUMBER_CONFIG_TOKENS.reduce(
    (config, [token, pattern]) => config.replace(token, format(now, pattern)),
    numberConfig ?? '',
  );

  return { prefix, sequence: '0'.repeat(size) };
};
