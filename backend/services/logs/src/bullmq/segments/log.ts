const prefix = '[segments]';

export const segmentLog = (message: string, detail?: unknown) =>
  detail === undefined
    ? console.info(`${prefix} ${message}`)
    : console.info(`${prefix} ${message}`, detail);

export const segmentSkip = (message: string, detail?: unknown) =>
  detail === undefined
    ? console.warn(`${prefix} ${message}`)
    : console.warn(`${prefix} ${message}`, detail);

export const segmentError = (message: string, error: unknown) =>
  console.error(`${prefix} ${message}`, error);
