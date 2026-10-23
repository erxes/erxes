import { z } from 'zod';
import {
  issueAgentReferences,
  AGENT_REFERENCE_ID_RE,
} from '@/agents/references';
import type { IAgentsNavigationEntry } from '@/agents/requestContext';

/**
 * The built-in `findPages` tool: ranks the client's navigable page
 * catalog (sent on the chat request and snapshotted into RequestContext)
 * against a free-text query and returns page reference tokens the model
 * can hand to the user as one-click chips.
 *
 * The catalog is client-supplied UI metadata — never a permission grant:
 * it only contains pages the requesting client already resolves.
 */

/** One catalog hit handed back to the model. */
export interface IAgentsPageMatch {
  label: string;
  group?: string;
  path: string;
  /** `[[page:<base64url(path)>:<label>]]` — copy verbatim into the reply. */
  reference: string;
}

const MAX_MATCHES = 8;

/**
 * The token id must satisfy the reference-id regex
 * (`[A-Za-z0-9_-]{1,64}`); a base64url encoding that overflows would
 * produce a token the UI never parses, so those entries are skipped.
 */
const pageTokenFor = (entry: IAgentsNavigationEntry): string | null => {
  const encoded = Buffer.from(entry.path, 'utf8').toString('base64url');
  if (!AGENT_REFERENCE_ID_RE.test(encoded)) return null;
  return `[[page:${encoded}:${entry.label}]]`;
};

/** Cheap stemmer: drop one trailing 's' so "pipelines" and "pipeline" match. */
const stem = (token: string): string =>
  token.length > 2 && token.endsWith('s') ? token.slice(0, -1) : token;

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(stem);

const entryTokens = (entry: IAgentsNavigationEntry): Set<string> =>
  new Set([
    ...tokenize(entry.label),
    ...tokenize(entry.group ?? ''),
    ...tokenize(entry.path),
  ]);

const scoreEntry = (queryTokens: string[], tokens: Set<string>): number => {
  let score = 0;
  for (const token of queryTokens) {
    if (tokens.has(token)) score += 1;
  }
  return score;
};

/**
 * Ranks `catalog` against `query`: each query token contributes a point
 * when it appears in the entry's label/group/path tokens; ties prefer the
 * shorter label. Pure — exported for tests.
 */
export const rankNavigationEntries = (
  query: string,
  catalog: IAgentsNavigationEntry[],
): IAgentsPageMatch[] => {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return catalog
    .map((entry) => ({
      entry,
      score: scoreEntry(queryTokens, entryTokens(entry)),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.entry.label.length - b.entry.label.length,
    )
    .map(({ entry }) => ({
      label: entry.label,
      ...(entry.group ? { group: entry.group } : {}),
      path: entry.path,
      reference: pageTokenFor(entry),
    }))
    .filter(
      (match): match is IAgentsPageMatch & { reference: string } =>
        match.reference !== null,
    )
    .slice(0, MAX_MATCHES);
};

/**
 * Builds the `findPages` tool. Async because `@mastra/core/tools` is
 * ESM-only and this module compiles as CommonJS.
 */
export const buildFindPagesTool = async () => {
  const { createTool } = await import('@mastra/core/tools');

  return createTool({
    id: 'findPages',
    description:
      'Find pages in the user\'s erxes workspace by what they are for, e.g. "sales pipeline", "customers", "approval settings". Input: { query }. Returns up to 8 matches, each with a page reference token; put the best match\'s token in your reply so the user can open the page with one click.',
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .max(200)
        .describe('What the user is trying to find or open'),
    }),
    execute: async ({ query }, context) => {
      const navigation = (
        context?.requestContext as { get?(key: string): unknown } | undefined
      )?.get?.('navigation');

      if (!Array.isArray(navigation) || navigation.length === 0) {
        return { pages: [], note: 'Page list unavailable for this client' };
      }

      const pages = rankNavigationEntries(
        query,
        navigation as IAgentsNavigationEntry[],
      );

      const issued = issueAgentReferences(pages.map((page) => page.reference));
      return {
        pages: pages.map((page, index) => ({
          ...page,
          reference: issued.references[index],
        })),
        referenceManifest: issued.referenceManifest,
      };
    },
  });
};
