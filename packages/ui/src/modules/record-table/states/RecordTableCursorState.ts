import { z } from 'zod';
import { keyedAtom } from 'erxes-ui/lib/keyed-atom';
import { storedFamily } from 'erxes-ui/lib/stored';

/**
 * Where a cursor-paged list was for this tab, per `sessionKey`, under the `filters` it was seen
 * with: the first row the header doesn't cover, how many pixels of it are scrolled past the
 * header (`rowOffset`), and the scroll offset.
 */
export const tablePositionState = storedFamily({
  key: 'erxes:table:position',
  session: true,
  schema: z.object({
    filters: z.string(),
    row: z.string(),
    rowOffset: z.number(),
    scroll: z.number(),
  }),
  initial: { filters: '', row: '', rowOffset: 0, scroll: 0 },
});

/** A list's position before any scroll: the top, under no filters. */
export const TOP_POSITION = { filters: '', row: '', rowOffset: 0, scroll: 0 };

/** The scrolling element of the list shown under each `sessionKey`, while it shows. */
export const tableViewportState = keyedAtom<HTMLElement | null>(null);
