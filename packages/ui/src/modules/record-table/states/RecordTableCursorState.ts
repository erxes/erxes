import { z } from 'zod';
import { storedFamily } from 'erxes-ui/lib/stored';

/**
 * Where a cursor-paged list was for this tab, per `sessionKey`: the first row in view and the
 * scroll offset, both under the `filters` they were seen with.
 */
export const tablePositionState = storedFamily({
  key: 'erxes:table:position',
  session: true,
  schema: z.object({ filters: z.string(), row: z.string(), scroll: z.number() }),
  initial: { filters: '', row: '', scroll: 0 },
});
