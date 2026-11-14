import {
  ASSISTANT_ARTIFACT_MAX_CHARS,
  AssistantArtifact,
  AssistantArtifactFormat,
} from '@erxes/core-contract';
import { tool } from 'ai';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const ArtifactInput = z.object({
  format: AssistantArtifactFormat.describe(
    'html for a report or dashboard, csv for a table to open in a spreadsheet, markdown for a document',
  ),
  title: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .describe('The deliverable title, such as "Q3 sales by city", not a greeting'),
  content: z
    .string()
    .trim()
    .min(1)
    .max(ASSISTANT_ARTIFACT_MAX_CHARS)
    .describe(
      'The whole file without code fences: HTML, comma-separated CSV with a header row, or Markdown',
    ),
});

type ArtifactInput = z.infer<typeof ArtifactInput>;

const EXTENSIONS = { html: 'html', csv: 'csv', markdown: 'md' } as const;

const HTML_RULES: [RegExp, string][] = [
  [/<\s*script\b/i, 'a <script> tag'],
  [/<\s*(iframe|frame|object|embed|applet|portal)\b/i, 'an embedded frame or object'],
  [/<\s*(form|input|button|select|textarea)\b/i, 'a form control'],
  [/<\s*(link|meta|base)\b/i, 'a <link>, <meta> or <base> tag'],
  [/\son[a-z]+\s*=/i, 'an event handler attribute'],
  [/javascript\s*:/i, 'a javascript: link'],
  [/@import/i, 'a CSS @import'],
  [
    /\b(src|href|srcset|poster|action|data|xlink:href)\s*=\s*["']?\s*(https?:)?\/\//i,
    'an outside resource',
  ],
  [/url\(\s*["']?\s*(https?:)?\/\//i, 'an outside resource'],
];

const checkHtml = (html: string) => {
  const found = HTML_RULES.find(([pattern]) => pattern.test(html));

  if (found) {
    throw new Error(
      `The HTML has ${found[1]}. Reports are static pages: no scripts, event handlers, forms or outside resources. Draw charts with inline SVG or CSS and write the file again.`,
    );
  }
};

const checkCsv = (csv: string) => {
  const rows = z
    .array(z.array(z.string()))
    .parse(parse(csv, { relax_column_count: true, skip_empty_lines: true, bom: true }));

  const width = rows[0]?.length ?? 0;

  if (rows.length < 2) throw new Error('The CSV needs a header row and at least one data row');

  rows.forEach((row, index) => {
    if (row.length !== width) {
      throw new Error(
        `Row ${index + 1} has ${row.length} columns; the header has ${width}. Quote values that contain commas and write the file again.`,
      );
    }
  });
};

const fileName = ({ title, format }: ArtifactInput) => {
  const base = title
    .replace(/\.(html?|csv|md)$/i, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

  return `${base || 'document'}.${EXTENSIONS[format]}`;
};

const artifactOf = (input: ArtifactInput) => {
  if (input.format === 'html') checkHtml(input.content);

  if (input.format === 'csv') checkCsv(input.content);

  return AssistantArtifact.parse({ ...input, filename: fileName(input) });
};

export const createArtifact = tool({
  description:
    'Deliver a file the member asked for: an HTML report or dashboard, a CSV table or a Markdown document. The panel shows it as a card with a preview and downloads (CSV also as Excel, Markdown also as Word and PDF). Never use it for an ordinary answer, a greeting or a question. It changes no workspace records.',
  inputSchema: ArtifactInput,
  outputSchema: AssistantArtifact,
  execute: (input) => artifactOf(input),
});
