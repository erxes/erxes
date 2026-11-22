import { fail, pgCode } from '~/http/errors';

/**
 * Runs a list. When a filter or search makes it too slow for the database's
 * statement timeout, the answer is a 400 `FILTER_TOO_SLOW` saying what to do,
 * not a 500.
 */
export const boundedList = async <T>(filtered: boolean, run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (filtered && pgCode(error) === '57014') {
      throw fail(
        'FILTER_TOO_SLOW',
        'This filter takes too long on this many records. Narrow it (add a tag, an owner or a date), or use “is” instead of “contains”.',
      );
    }

    throw error;
  }
};
