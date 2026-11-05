export interface IMdInline {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  href?: string;
}

export type MdBlock =
  | { type: 'heading'; level: number; inlines: IMdInline[] }
  | { type: 'paragraph'; inlines: IMdInline[] }
  | { type: 'list'; ordered: boolean; items: IMdInline[][] }
  | { type: 'code'; text: string }
  | { type: 'quote'; inlines: IMdInline[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'hr' };

const HEADING = /^(#{1,6})\s+(.*?)\s*$/;
const HR = /^ {0,3}([-*_])[ \t]*\1[ \t]*\1(?:[ \t]*\1)*[ \t]*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const LIST_ITEM = /^ {0,3}([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TABLE_SEPARATOR = /^ {0,3}\|?[ \t:|-]+\|?[ \t]*$/;

const INLINE_PATTERN =
  /(`+)([^`]+?)\1|\*\*([^*]+?)\*\*|__([^_]+?)__|\*([^*]+?)\*|_([^_]+?)_|\[([^\]]+?)\]\(([^)\s]+?)\)/g;

export const parseInline = (text: string): IMdInline[] => {
  const inlines: IMdInline[] = [];
  let lastIndex = 0;
  INLINE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = INLINE_PATTERN.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      inlines.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[2] !== undefined) {
      inlines.push({ text: match[2], code: true });
    } else if (match[3] !== undefined) {
      inlines.push({ text: match[3], bold: true });
    } else if (match[4] !== undefined) {
      inlines.push({ text: match[4], bold: true });
    } else if (match[5] !== undefined) {
      inlines.push({ text: match[5], italic: true });
    } else if (match[6] !== undefined) {
      inlines.push({ text: match[6], italic: true });
    } else if (match[7] !== undefined && match[8] !== undefined) {
      inlines.push({ text: match[7], href: match[8] });
    }
    lastIndex = match.index + match[0].length;
    match = INLINE_PATTERN.exec(text);
  }
  if (lastIndex < text.length) {
    inlines.push({ text: text.slice(lastIndex) });
  }
  return inlines;
};

const splitTableRow = (line: string): string[] => {
  let cells = line.split('|');
  if (cells.length > 0 && cells[0].trim() === '') {
    cells = cells.slice(1);
  }
  if (cells.length > 0 && cells[cells.length - 1].trim() === '') {
    cells = cells.slice(0, -1);
  }
  return cells.map((cell) => cell.trim());
};

const isTableSeparator = (line: string): boolean =>
  TABLE_SEPARATOR.test(line) && line.includes('-') && line.includes('|');

/**
 * Line-based parser for the markdown subset the artifact conventions teach:
 * headings, paragraphs, ordered/unordered lists, fenced and indented code,
 * blockquotes, pipe tables, and thematic breaks. Inline runs support bold,
 * italic, code spans, and links. Unknown or malformed lines degrade to
 * paragraph text.
 */
export const parseMarkdownBlocks = (markdown: string): MdBlock[] => {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        inlines: parseInline(heading[2]),
      });
      i++;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const fenceChar = fence[1][0];
      const fenceLength = fence[1].length;
      const body: string[] = [];
      i++;
      while (i < lines.length) {
        const closer = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[i]);
        if (closer && closer[1][0] === fenceChar && closer[1].length >= fenceLength) {
          i++;
          break;
        }
        body.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      const quoted: string[] = [quote[1]];
      i++;
      while (i < lines.length) {
        const next = QUOTE.exec(lines[i]);
        if (!next) break;
        quoted.push(next[1]);
        i++;
      }
      blocks.push({ type: 'quote', inlines: parseInline(quoted.join(' ')) });
      continue;
    }

    const isTable = line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]);
    if (isTable) {
      const header = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    const listItem = LIST_ITEM.exec(line);
    if (listItem) {
      const ordered = /\d/.test(listItem[1][0]);
      const items: string[] = [listItem[2]];
      i++;
      while (i < lines.length) {
        const next = LIST_ITEM.exec(lines[i]);
        if (next) {
          items.push(next[2]);
          i++;
          continue;
        }
        const continuation = /^ {2,}\S/.test(lines[i]);
        if (continuation && lines[i].trim() !== '') {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
          continue;
        }
        break;
      }
      blocks.push({
        type: 'list',
        ordered,
        items: items.map((item) => parseInline(item)),
      });
      continue;
    }

    const isIndentedCode = /^ {4,}/.test(line);
    if (isIndentedCode) {
      const body: string[] = [];
      while (i < lines.length && (lines[i].trim() === '' || /^ {4,}/.test(lines[i]))) {
        if (lines[i].trim() === '') {
          // Peek: a blank line only continues the block when the next line is indented too.
          if (i + 1 < lines.length && /^ {4,}/.test(lines[i + 1])) {
            body.push('');
            i++;
            continue;
          }
          break;
        }
        body.push(lines[i].replace(/^ {4}/, ''));
        i++;
      }
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }

    const paragraph: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !HEADING.test(lines[i]) &&
      !HR.test(lines[i]) &&
      !FENCE.test(lines[i]) &&
      !QUOTE.test(lines[i]) &&
      !LIST_ITEM.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', inlines: parseInline(paragraph.join(' ')) });
  }

  return blocks;
};
