/**
 * The segmentation worker's trace.
 *
 * Everything here runs off the write path and writes to collections nobody is
 * watching, so a job that quietly does nothing is indistinguishable from one
 * that worked. Each step says what it looked for and what it found, which is
 * what turns "membership did not appear" into a single line naming the reason.
 */

const prefix = '[segments]';

export const segmentLog = (message: string, detail?: unknown) =>
  detail === undefined
    ? console.info(`${prefix} ${message}`)
    : console.info(`${prefix} ${message}`, detail);

/** A job that ended early, and why. Not an error - usually nothing to do. */
export const segmentSkip = (message: string, detail?: unknown) =>
  detail === undefined
    ? console.warn(`${prefix} ${message}`)
    : console.warn(`${prefix} ${message}`, detail);

export const segmentError = (message: string, error: unknown) =>
  console.error(`${prefix} ${message}`, error);
