import { oc } from '@orpc/contract';
import { COMMON_ERRORS } from './errors';
import { z } from 'zod';
import { Id } from './common';
import { SearchType } from './values';

/** One record global search found in core. */
export const SearchHit = z.object({
  type: SearchType,
  id: Id,
  title: z.string(),
  /** What tells it apart: an email or phone, a code, a lead's state, a unit's kind. */
  subtitle: z.string().nullable(),
});

export type SearchHit = z.infer<typeof SearchHit>;

/** A search route a plugin declares in its manifest: what its group is called and where to ask. */
export const PluginSearchSource = z.object({
  label: z.string().trim().min(1).max(60),
  path: z.string().regex(/^(\/[a-z0-9][a-z0-9_.-]*)+$/, 'a path like /search/deals'),
});

const base = oc.errors(COMMON_ERRORS);

/** One search box over the organisation's records: core's here, plugins' at their own routes. */
export const searchContract = {
  global: base
    .route({
      method: 'GET',
      path: '/search',
      summary: 'Search everything',
      description:
        'Records matching every word of `q`, the first `limit` of each type the member may see: people and companies with contacts.view, team members with team.view, products, branches and departments',
    })
    .input(
      z.object({
        q: z.string().trim().min(1).max(100),
        /** Only this type (a group's "show more"). */
        type: SearchType.optional(),
        limit: z.coerce.number().int().min(1).max(20).default(5),
      }),
    )
    .output(z.object({ data: z.array(SearchHit).max(100) })),
};
