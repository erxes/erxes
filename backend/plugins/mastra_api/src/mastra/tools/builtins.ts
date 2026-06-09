import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search Wikipedia for articles related to a query. Returns top results with titles and snippets.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().int().min(1).max(10).default(5).describe('Max results'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      snippet: z.string(),
      pageId: z.number(),
    })),
    totalHits: z.number(),
  }),
  execute: async ({ query, limit }) => {
    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srlimit', String(limit ?? 5));
    url.searchParams.set('srprop', 'snippet');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const res = await fetch(url.toString());
    const data = await res.json() as any;

    return {
      results: data.query.search.map((r: any) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]+>/g, ''),
        pageId: r.pageid,
      })),
      totalHits: data.query.searchinfo.totalhits,
    };
  },
});

export const fetchUrlTool = createTool({
  id: 'fetch-url',
  description: 'Fetch the full text content of a Wikipedia article by title or URL.',
  inputSchema: z.object({
    title: z.string().optional().describe('Wikipedia article title'),
    pageId: z.number().optional().describe('Wikipedia page ID from web-search'),
  }),
  outputSchema: z.object({
    title: z.string(),
    extract: z.string(),
    url: z.string(),
  }),
  execute: async ({ title, pageId }) => {
    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('prop', 'extracts|info');
    url.searchParams.set('exintro', 'true');
    url.searchParams.set('explaintext', 'true');
    url.searchParams.set('inprop', 'url');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    if (pageId) {
      url.searchParams.set('pageids', String(pageId));
    } else if (title) {
      url.searchParams.set('titles', title);
    } else {
      throw new Error('Provide either title or pageId');
    }

    const res = await fetch(url.toString());
    const data = await res.json() as any;
    const page = Object.values(data.query.pages)[0] as any;

    return {
      title: page.title,
      extract: page.extract ?? 'No content found.',
      url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    };
  },
});

export const calculatorTool = createTool({
  id: 'calculator',
  description: 'Evaluate a mathematical expression and return the numeric result.',
  inputSchema: z.object({
    expression: z.string().describe('Math expression, e.g. "2 + 2 * 10"'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async ({ expression }) => {
    // Safe math eval — only allow numbers and basic operators
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    const result = Function(`'use strict'; return (${sanitized})`)() as number;
    return { result, expression: sanitized };
  },
});

export const BUILTIN_TOOLS: Record<string, any> = {
  webSearch: webSearchTool,
  fetchUrl: fetchUrlTool,
  calculator: calculatorTool,
};

export function getBuiltinTool(builtinType: string) {
  return BUILTIN_TOOLS[builtinType] ?? null;
}
