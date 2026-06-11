import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { lookup } from 'node:dns/promises';
import { companyKnowledgeTool } from '~/mastra/knowledge/knowledgeTool';
import { readAttachmentTool } from './attachmentTool';
import { WORKFLOW_BUILTIN_TOOLS } from './workflowTools';

const FETCH_TIMEOUT_MS = 10_000;
const UA = 'Mozilla/5.0 (compatible; erxes-agent/1.0)';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// DuckDuckGo's HTML endpoint — no API key needed. Result hrefs are DDG
// redirect URLs — the real target lives in the `uddg` query param. Ad slots
// point at duckduckgo.com/y.js and are skipped.
async function ddgSearch(query: string, limit: number): Promise<SearchResult[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`DuckDuckGo search failed: ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];
  const blockRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) && results.length < limit) {
    const href = decodeEntities(m[1]);
    const uddg = href.match(/[?&]uddg=([^&]+)/);
    const target = uddg ? decodeURIComponent(uddg[1]) : href;
    if (target.includes('duckduckgo.com/y.js')) continue;
    results.push({ title: stripTags(m[2]), url: target, snippet: stripTags(m[3]) });
  }
  return results;
}

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for any topic. Returns top results with titles, URLs and snippets. Use fetch-url to read a result in full.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().int().min(1).max(10).default(5).describe('Max results'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
  execute: async ({ query, limit }) => {
    return { results: await ddgSearch(query, limit ?? 5) };
  },
});

function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase();
    if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
    return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a === 169 && b === 254 ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  );
}

// The model controls the URL, so fetch-url is an SSRF surface: http(s) only,
// no private/link-local targets, and every redirect hop is re-validated.
async function assertPublicHttpUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are allowed');
  }
  const addrs = await lookup(url.hostname, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new Error('URL resolves to a private or unknown address');
  }
  return url;
}

async function safeFetch(raw: string): Promise<{ res: Response; finalUrl: string }> {
  let url = await assertPublicHttpUrl(raw);
  for (let hop = 0; hop < 4; hop++) {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      url = await assertPublicHttpUrl(new URL(loc, url).toString());
      continue;
    }
    return { res, finalUrl: url.toString() };
  }
  throw new Error('Too many redirects');
}

const MAX_CONTENT_CHARS = 8_000;

export const fetchUrlTool = createTool({
  id: 'fetch-url',
  description: 'Fetch a public web page and return its readable text content. Use after web-search to read a result in full.',
  inputSchema: z.object({
    url: z.string().describe('Absolute http(s) URL, e.g. from web-search results'),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  execute: async ({ url }) => {
    const { res, finalUrl } = await safeFetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const body = (await res.text()).slice(0, 500_000);
    const title = stripTags(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const content = stripTags(
      body
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<(nav|header|footer|noscript)[\s\S]*?<\/\1>/gi, ' '),
    ).slice(0, MAX_CONTENT_CHARS);

    return { url: finalUrl, title, content: content || 'No readable content found.' };
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

// ─── Chart visualization tool ─────────────────────────────────────────────────
//
// Returns a serialized chart-viz JSON payload. The agent is instructed (via
// routing.ts) to embed the returned string verbatim in a ```chart-viz``` fenced
// code block so the chat UI renders it as an interactive chart.

const SAFE_CSS_VAR_KEY = /^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/;
const SAFE_CSS_COLOR = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\))$/;

const seriesItemSchema = z.object({
  key: z.string().refine((v) => SAFE_CSS_VAR_KEY.test(v), {
    message: 'key must start with a letter and contain only alphanumeric, dash, or underscore chars',
  }),
  label: z.string().max(200),
  color: z.string().optional(),
});

const dataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const renderChartTool = createTool({
  id: 'render-chart',
  description:
    'Build a data visualization chart (bar, line, area, or pie) and return the serialized payload. ' +
    'The UI will render it as an interactive chart in the chat. ' +
    'Use this whenever the user asks to see data as a chart or graph.',
  inputSchema: z.object({
    chartType: z.enum(['bar', 'line', 'area', 'pie']).describe('Chart type'),
    title: z.string().max(200).describe('Chart title shown above the chart'),
    description: z.string().max(200).optional().describe('Optional subtitle'),
    series: z.array(seriesItemSchema).min(1).max(10).describe(
      'Data series. Each entry maps a key (used as dataKey in data rows) to a label and optional color.',
    ),
    data: z.array(dataPointSchema).min(1).max(100).describe(
      'Data rows. Each row must have a "label" string field and numeric values for every series key.',
    ),
  }),
  outputSchema: z.object({ chartJson: z.string() }),
  execute: async ({ chartType, title, description, series, data }) => {
    const cleanSeries = series
      .filter((s) => SAFE_CSS_VAR_KEY.test(s.key))
      .map((s) => ({
        key: s.key,
        label: s.label.slice(0, 200),
        color:
          s.color && SAFE_CSS_COLOR.test(s.color.trim()) ? s.color.trim() : undefined,
      }));

    const validKeys = new Set(cleanSeries.map((s) => s.key));

    const cleanData = data.map((row) => {
      const point: Record<string, string | number> = {
        label: typeof row['label'] === 'string' ? row['label'].slice(0, 200) : '',
      };
      for (const key of validKeys) {
        const k = key as string;
        const v = (row as Record<string, unknown>)[k];
        const n = Number(v);
        point[k] = Number.isFinite(n) ? n : 0;
      }
      return point;
    });

    const payload = {
      type: 'chart-viz',
      chartType,
      title: title.slice(0, 200),
      description: description?.slice(0, 200),
      series: cleanSeries,
      data: cleanData,
      sentAt: new Date().toISOString(),
    };

    return { chartJson: JSON.stringify(payload) };
  },
});

export const BUILTIN_TOOLS: Record<string, any> = {
  webSearch: webSearchTool,
  fetchUrl: fetchUrlTool,
  calculator: calculatorTool,
  renderChart: renderChartTool,
  // No-ops with a clear message unless ERXES_AGENT_KNOWLEDGE=enable.
  companyKnowledge: companyKnowledgeTool,
  // Reads chat attachments (pdf/docx/xlsx/csv/…). Also force-bound outside
  // the policy filter — see agentRuntime — so attached files are always readable.
  readAttachment: readAttachmentTool,
  // Builder tools — the master-agent loop: guide → validate → simulate →
  // save → run/observe. Deny per agent via builtin:<key> when needed.
  ...WORKFLOW_BUILTIN_TOOLS,
};

export function getBuiltinTool(builtinType: string) {
  return BUILTIN_TOOLS[builtinType] ?? null;
}
