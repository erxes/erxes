export type ArtifactType = 'html' | 'xlsx' | 'docx' | 'pdf';

export const ARTIFACT_TYPES: readonly ArtifactType[] = [
  'html',
  'xlsx',
  'docx',
  'pdf',
];

export interface IArtifact {
  type: ArtifactType;
  /** Display title; never empty (falls back to a labeled default). */
  title: string;
  /** Ready-to-use download filename with the correct extension. */
  filename: string;
  /** Raw fence body, verbatim except CRLF normalization. */
  content: string;
  /** False when generation ended before the closing fence/document. */
  complete: boolean;
}

export type MessageSegment =
  | { kind: 'text'; text: string }
  | { kind: 'artifact'; artifact: IArtifact };

interface IFenceOpen {
  fenceChar: '`' | '~';
  fenceLength: number;
  info: string;
}

const OPEN_FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;
const CLOSE_FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;

const EXTENSIONS: Record<ArtifactType, string> = {
  html: '.html',
  xlsx: '.xlsx',
  docx: '.docx',
  pdf: '.pdf',
};

const DEFAULT_NAMES: Record<ArtifactType, string> = {
  html: 'report',
  xlsx: 'spreadsheet',
  docx: 'document',
  pdf: 'document',
};

const MAX_FILENAME_LENGTH = 80;
const MAX_TITLE_LENGTH = 100;

const isArtifactLang = (lang: string): lang is ArtifactType =>
  ARTIFACT_TYPES.includes(lang.toLowerCase() as ArtifactType);

const parseOpenFence = (line: string): IFenceOpen | null => {
  const match = OPEN_FENCE.exec(line);
  if (!match) return null;
  return {
    fenceChar: match[1][0] === '~' ? '~' : '`',
    fenceLength: match[1].length,
    info: match[2].trim(),
  };
};

const findCloser = (
  lines: string[],
  from: number,
  open: IFenceOpen,
): number => {
  for (let i = from; i < lines.length; i++) {
    const match = CLOSE_FENCE.exec(lines[i]);
    if (
      match &&
      match[1][0] === open.fenceChar &&
      match[1].length >= open.fenceLength
    ) {
      return i;
    }
  }
  return -1;
};

const sanitizeTitle = (type: ArtifactType, rawTitle: string): string => {
  let title = rawTitle.trim();
  title = title.replace(/^["']+|["']+$/g, '');
  const ext = EXTENSIONS[type];
  if (title.toLowerCase().endsWith(ext)) {
    title = title.slice(0, -ext.length);
  }
  // eslint-disable-next-line no-control-regex
  title = title.replace(/[\u0000-\u001f]/g, '');
  title = title.trim().slice(0, MAX_TITLE_LENGTH).trim();
  return title;
};

const toFilenameBase = (title: string): string =>
  title
    .replace(/\s+/g, '-')
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, MAX_FILENAME_LENGTH)
    .replace(/[-.]+$/g, '');

const buildFilename = (
  type: ArtifactType,
  title: string,
  ordinal: number,
): string => {
  const ext = EXTENSIONS[type];
  if (!title) {
    return `${DEFAULT_NAMES[type]}-${ordinal}${ext}`;
  }
  const base = toFilenameBase(title) || `${DEFAULT_NAMES[type]}-${ordinal}`;
  return base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`;
};

const buildArtifact = (
  type: ArtifactType,
  rawTitle: string,
  content: string,
  ordinal: number,
  complete = true,
): IArtifact => {
  const title = sanitizeTitle(type, rawTitle);
  return {
    type,
    title: title || `${DEFAULT_NAMES[type]}-${ordinal}`,
    filename: buildFilename(type, title, ordinal),
    content,
    complete,
  };
};

/** Split prose and recognized artifacts without exposing unfinished source. */
export const splitArtifacts = (text: string): MessageSegment[] => {
  const normalized = text.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const segments: MessageSegment[] = [];
  let textStart = 0;
  const ordinals: Record<ArtifactType, number> = {
    html: 0,
    xlsx: 0,
    docx: 0,
    pdf: 0,
  };
  let i = 0;

  const flushText = (end: number) => {
    if (end > textStart) {
      const joined = lines
        .slice(textStart, end)
        .join('\n')
        .replace(/^\n+|\n+$/g, '');
      if (joined.trim().length > 0) {
        segments.push({ kind: 'text', text: joined });
      }
    }
  };

  while (i < lines.length) {
    const open = parseOpenFence(lines[i]);
    if (!open && /^ {0,3}(?:<!doctype\s+html\b|<html(?:\s|>))/i.test(lines[i])) {
      const start = i;
      const end = lines.findIndex(
        (line, index) => index >= start && /<\/html\s*>/i.test(line),
      );
      flushText(i);
      const body = lines
        .slice(i, end === -1 ? lines.length : end + 1)
        .join('\n');
      segments.push({
        kind: 'artifact',
        artifact: buildArtifact(
          'html',
          /<title[^>]*>([^<]*)<\/title>/i.exec(body)?.[1] ?? '',
          body,
          ++ordinals.html,
          end !== -1,
        ),
      });
      textStart = end === -1 ? lines.length : end + 1;
      i = textStart;
      continue;
    }
    if (!open) {
      i++;
      continue;
    }
    const lang = (open.info.split(/\s+/)[0] ?? '').toLowerCase();
    if (!isArtifactLang(lang)) {
      // Plain code fence (any language): skip past its body so fences inside
      // code examples are never mistaken for artifacts.
      const closer = findCloser(lines, i + 1, open);
      i = closer === -1 ? lines.length : closer + 1;
      continue;
    }
    const closer = findCloser(lines, i + 1, open);
    flushText(i);
    ordinals[lang]++;
    const rawTitle = open.info.slice(lang.length).trim();
    segments.push({
      kind: 'artifact',
      artifact: buildArtifact(
        lang,
        rawTitle,
        lines.slice(i + 1, closer === -1 ? lines.length : closer).join('\n'),
        ordinals[lang],
        closer !== -1,
      ),
    });
    textStart = closer === -1 ? lines.length : closer + 1;
    i = textStart;
  }

  flushText(lines.length);
  return segments;
};
