import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ExpectedError } from 'erxes-api-shared/utils';
import { lookup } from 'node:dns/promises';
import {
  decodeHtmlEntities as decodeEntities,
  stripAllTags,
  stripScriptAndStyleBlocks,
} from '~/mastra/html';
import { companyKnowledgeTool } from '~/mastra/knowledge/knowledgeTool';
import { agentKnowledgeTool } from '~/mastra/learning/learningTool';
import { readAttachmentTool } from './attachmentTool';
import { WORKFLOW_BUILTIN_TOOLS } from './workflowTools';

const FETCH_TIMEOUT_MS = 10_000;
const UA = 'Mozilla/5.0 (compatible; erxes-agent/1.0)';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/** Strip HTML tags, decode entities, and collapse whitespace. */
function stripTags(html: string): string {
  return decodeEntities(stripAllTags(html)).replace(/\s+/g, ' ').trim();
}

// DuckDuckGo's HTML endpoint — no API key needed. Result hrefs are DDG
// redirect URLs — the real target lives in the `uddg` query param. Ad slots
// point at duckduckgo.com/y.js and are skipped.
async function ddgSearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`DuckDuckGo search failed: ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];
  const blockRe =
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html)) && results.length < limit) {
    const href = decodeEntities(match[1]);
    const uddg = href.match(/[?&]uddg=([^&]+)/);
    const target = uddg ? decodeURIComponent(uddg[1]) : href;
    if (target.includes('duckduckgo.com/y.js')) continue;
    results.push({
      title: stripTags(match[2]),
      url: target,
      snippet: stripTags(match[3]),
    });
  }
  return results;
}

export const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web for any topic. Returns top results with titles, URLs and snippets. Use fetch-url to read a result in full.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().int().min(1).max(10).default(5).describe('Max results'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      }),
    ),
  }),
  execute: async ({ query, limit }) => {
    return { results: await ddgSearch(query, limit ?? 5) };
  },
});

/** True for loopback, RFC1918, link-local, and IPv6 private ranges. */
function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase();
    if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
    return (
      v6 === '::1' ||
      v6 === '::' ||
      v6.startsWith('fc') ||
      v6.startsWith('fd') ||
      v6.startsWith('fe80')
    );
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

// The model controls the URL, so fetch-url is an SSRF surface: http(s) only,
// no private/link-local targets, and every redirect hop is re-validated.
async function assertPublicHttpUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ExpectedError('Only http(s) URLs are allowed');
  }
  const addrs = await lookup(url.hostname, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new ExpectedError('URL resolves to a private or unknown address');
  }
  return url;
}

/** Fetch with manual redirects, re-validating every hop against SSRF. */
async function safeFetch(
  raw: string,
): Promise<{ res: Response; finalUrl: string }> {
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
  description:
    'Fetch a public web page and return its readable text content. Use after web-search to read a result in full.',
  inputSchema: z.object({
    url: z
      .string()
      .describe('Absolute http(s) URL, e.g. from web-search results'),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  execute: async ({ url }) => {
    const { res, finalUrl } = await safeFetch(url);
    if (!res.ok)
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const body = (await res.text()).slice(0, 500_000);
    const title = stripTags(
      body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '',
    );
    const content = stripTags(
      stripScriptAndStyleBlocks(body).replace(
        /<(nav|header|footer|noscript)\b[\s\S]*?<\/\1\b[^>]*>/gi,
        ' ',
      ),
    ).slice(0, MAX_CONTENT_CHARS);

    return {
      url: finalUrl,
      title,
      content: content || 'No readable content found.',
    };
  },
});

export const calculatorTool = createTool({
  id: 'calculator',
  description:
    'Evaluate a mathematical expression and return the numeric result.',
  inputSchema: z.object({
    expression: z.string().describe('Math expression, e.g. "2 + 2 * 10"'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: ({ expression }) => {
    const result = evalMathExpression(expression);
    return Promise.resolve({ result, expression });
  },
});

// Tiny recursive-descent evaluator for + - * / ( ) and decimal numbers — no
// dynamic code execution, throws a readable error on anything else. The
// grammar rules are mutually recursive, so they are hoisted function
// declarations rather than const arrows.
function evalMathExpression(expr: string): number {
  let pos = 0;
  const source = expr;

  /** Advance past spaces and tabs. */
  function skipWs(): void {
    while (
      pos < source.length &&
      (source[pos] === ' ' || source[pos] === '\t')
    ) {
      pos++;
    }
  }

  /** Parse a decimal number literal at the cursor. */
  function parseNumber(): number {
    skipWs();
    const start = pos;
    while (
      pos < source.length &&
      ((source[pos] >= '0' && source[pos] <= '9') || source[pos] === '.')
    ) {
      pos++;
    }
    if (start === pos) {
      throw new ExpectedError(
        `Unexpected character "${source[pos] ?? 'end of input'}" in expression`,
      );
    }
    const num = Number(source.slice(start, pos));
    if (Number.isNaN(num))
      throw new ExpectedError('Invalid number in expression');
    return num;
  }

  /** Parse unary +/-, parenthesised groups, or a number. */
  function parseFactor(): number {
    skipWs();
    const ch = source[pos];
    if (ch === '-') {
      pos++;
      return -parseFactor();
    }
    if (ch === '+') {
      pos++;
      return parseFactor();
    }
    if (ch === '(') {
      pos++;
      const inner = parseAddSub();
      skipWs();
      if (source[pos] !== ')')
        throw new ExpectedError('Unbalanced parentheses');
      pos++;
      return inner;
    }
    return parseNumber();
  }

  /** Parse a chain of * and / over factors. */
  function parseMulDiv(): number {
    let acc = parseFactor();
    for (;;) {
      skipWs();
      const ch = source[pos];
      if (ch === '*' || ch === '/') {
        pos++;
        const rhs = parseFactor();
        acc = ch === '*' ? acc * rhs : acc / rhs;
      } else {
        return acc;
      }
    }
  }

  /** Parse a chain of + and - over products. */
  function parseAddSub(): number {
    let acc = parseMulDiv();
    for (;;) {
      skipWs();
      const ch = source[pos];
      if (ch === '+' || ch === '-') {
        pos++;
        const rhs = parseMulDiv();
        acc = ch === '+' ? acc + rhs : acc - rhs;
      } else {
        return acc;
      }
    }
  }

  const value = parseAddSub();
  skipWs();
  if (pos < source.length) {
    throw new ExpectedError(
      `Unexpected character "${source[pos]}" in expression`,
    );
  }
  return value;
}

// ─── Chart visualization tool ─────────────────────────────────────────────────
//
// Returns a serialized chart-viz JSON payload. The agent is instructed (via
// routing.ts) to embed the returned string verbatim in a ```chart-viz``` fenced
// code block so the chat UI renders it as an interactive chart.

const SAFE_CSS_VAR_KEY = /^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/;
const SAFE_CSS_COLOR =
  /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\))$/;

const seriesItemSchema = z.object({
  key: z.string().refine((key) => SAFE_CSS_VAR_KEY.test(key), {
    message:
      'key must start with a letter and contain only alphanumeric, dash, or underscore chars',
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
    series: z
      .array(seriesItemSchema)
      .min(1)
      .max(10)
      .describe(
        'Data series. Each entry maps a key (used as dataKey in data rows) to a label and optional color.',
      ),
    data: z
      .array(dataPointSchema)
      .min(1)
      .max(100)
      .describe(
        'Data rows. Each row must have a "label" string field and numeric values for every series key.',
      ),
  }),
  outputSchema: z.object({ chartJson: z.string() }),
  execute: ({ chartType, title, description, series, data }) => {
    const cleanSeries = series
      .filter((item) => SAFE_CSS_VAR_KEY.test(item.key))
      .map((item) => ({
        key: item.key,
        label: item.label.slice(0, 200),
        color:
          item.color && SAFE_CSS_COLOR.test(item.color.trim())
            ? item.color.trim()
            : undefined,
      }));

    const validKeys = new Set(cleanSeries.map((item) => item.key));

    const cleanData = data.map((row) => {
      const point: Record<string, string | number> = {
        label:
          typeof row['label'] === 'string' ? row['label'].slice(0, 200) : '',
      };
      for (const key of validKeys) {
        const k = key as string;
        const raw = (row as Record<string, unknown>)[k];
        const num = Number(raw);
        point[k] = Number.isFinite(num) ? num : 0;
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

    return Promise.resolve({ chartJson: JSON.stringify(payload) });
  },
});

// Heterogeneous createTool instances; callers narrow per tool as needed.
export const BUILTIN_TOOLS: Record<string, ReturnType<typeof createTool>> = {
  webSearch: webSearchTool,
  fetchUrl: fetchUrlTool,
  calculator: calculatorTool,
  renderChart: renderChartTool,
  // No-ops with a clear message unless ERXES_AGENT_KNOWLEDGE=enable.
  companyKnowledge: companyKnowledgeTool,
  // Distilled lessons from past conversations. No-op unless
  // ERXES_AGENT_LEARNING=enable.
  agentKnowledge: agentKnowledgeTool,
  // Reads chat attachments (pdf/docx/xlsx/csv/…). Also force-bound outside
  // the policy filter — see agentRuntime — so attached files are always readable.
  readAttachment: readAttachmentTool,
  // Builder tools — the master-agent loop: guide → validate → simulate →
  // save → run/observe. Deny per agent via builtin:<key> when needed.
  ...WORKFLOW_BUILTIN_TOOLS,
};

/** Look up a builtin tool by its registry key, or null when unknown. */
export function getBuiltinTool(builtinType: string) {
  return BUILTIN_TOOLS[builtinType] ?? null;
}
