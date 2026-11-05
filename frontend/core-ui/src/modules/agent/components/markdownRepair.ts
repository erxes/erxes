/**
 * Preprocessor that normalizes broken pipe-table inputs the assistant
 * occasionally emits — missing separator rows and collapsed multi-row
 * lines — into text `remark-gfm` will parse as a real table.
 *
 * It does not touch well-formed GFM tables where every data line already
 * fits the column count, fenced code blocks, or non-table lines that
 * merely contain a stray pipe.
 *
 * Detection runs on consecutive non-blank lines that start with `|`. The
 * header (first non-separator line) is the source of truth for the
 * column count: a header with N non-empty cells means N columns. Any
 * data line that contains more cells than that was the result of
 * multiple rows being collapsed onto one line and gets re-chunked;
 * data lines with fewer cells are kept as a short final row. An
 * existing separator row is preserved (its alignment markers carry
 * intent); a missing one is generated.
 */
const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;

const splitCells = (line: string): string[] => {
  let cells = line.split('|');

  if (cells.length > 0 && cells[0].trim() === '') {
    cells = cells.slice(1);
  }

  if (cells.length > 0 && cells[cells.length - 1].trim() === '') {
    cells = cells.slice(0, -1);
  }

  return cells.map((cell) => cell.trim());
};

const nonEmptyCount = (cells: string[]): number =>
  cells.reduce((count, cell) => count + (cell === '' ? 0 : 1), 0);

const isSeparatorLine = (line: string): boolean =>
  /^ {0,3}\|?[ \t:|-]+\|?[ \t]*$/.test(line) &&
  line.includes('-') &&
  line.includes('|');

const isTableLine = (line: string): boolean => {
  const trimmed = line.trim();

  if (!trimmed.startsWith('|')) {
    return false;
  }

  return nonEmptyCount(splitCells(trimmed)) >= 2;
};

const formatRow = (cells: string[]): string => `| ${cells.join(' | ')} |`;

const formatSeparator = (width: number): string =>
  `| ${Array.from({ length: width }, () => '---').join(' | ')} |`;

const stripEmptyBoundary = (cells: string[]): string[] => {
  let head = cells;

  if (head.length > 0 && head[0] === '') {
    head = head.slice(1);
  }

  if (head.length > 0 && head[head.length - 1] === '') {
    head = head.slice(0, -1);
  }

  return head;
};

/**
 * Matches one GFM separator cell: dashes with optional alignment colons
 * (`---`, `:---`, `---:`, `:---:`).
 */
const SEPARATOR_CELL = /^:?-+:?$/;

/**
 * Splits a separator row the assistant merged onto the end of a line
 * (`| A | B |---|---|`) back off it. Left in place, those dashes read as
 * extra header cells and inflate the column count, so every data row
 * downstream gets re-chunked into the wrong shape.
 *
 * Returns `null` when there is no coherent trailing run: the run must be at
 * least two cells wide — a single trailing `---` is far more likely a
 * literal "no value" cell than a one-column separator — and at least two
 * real cells must survive the split.
 */
const splitTrailingSeparator = (
  line: string,
): { cells: string[]; separator: string[] } | null => {
  const cells = stripEmptyBoundary(splitCells(line));

  if (cells.length < 4) {
    return null;
  }

  let runStart = cells.length;

  while (runStart > 0 && SEPARATOR_CELL.test(cells[runStart - 1])) {
    runStart -= 1;
  }

  const separator = cells.slice(runStart);
  const remaining = cells.slice(0, runStart);

  if (separator.length < 2 || remaining.length < 2) {
    return null;
  }

  return { cells: remaining, separator };
};

const reChunkCells = (cells: string[], columnCount: number): string[] => {
  const nonEmpty = cells.filter((cell) => cell !== '');

  if (nonEmpty.length === 0) {
    return [];
  }

  const rows: string[][] = [];

  for (let i = 0; i < nonEmpty.length; i += columnCount) {
    rows.push(nonEmpty.slice(i, i + columnCount));
  }

  return rows.map((row) => formatRow(row));
};

const repairBlock = (blockLines: string[]): string[] => {
  const separatorIndices = blockLines
    .map((line, index) => (isSeparatorLine(line) ? index : -1))
    .filter((index) => index !== -1);

  const dataIndices = blockLines
    .map((line, index) => (isSeparatorLine(line) ? -1 : index))
    .filter((index) => index !== -1);

  if (dataIndices.length < 1) {
    // No actual table data — leave the block alone.
    return blockLines;
  }

  const headerIndex = dataIndices[0];

  // The assistant sometimes merges the separator row onto the end of the
  // header line (`| A | B |---|---|`). Split it off before the header is
  // measured, or the dashes count as extra columns.
  const headerSplit = splitTrailingSeparator(blockLines[headerIndex]);

  const headerCells = headerSplit
    ? headerSplit.cells
    : splitCells(blockLines[headerIndex]).filter((cell) => cell !== '');

  // A merged separator is only trusted when it agrees with the header's
  // column count — a mismatched run (wider or narrower) is leftover junk
  // and gets regenerated from the header instead.
  const mergedSeparator =
    headerSplit && headerSplit.separator.length === headerCells.length
      ? formatRow(headerSplit.separator)
      : null;

  // The header is the source of truth for the table shape: a header with
  // N non-empty cells means N columns. Data lines that contain more
  // cells than that were the result of multiple rows being collapsed
  // onto one line; data lines with fewer cells are kept as a short
  // final row.
  let columnCount = headerCells.length;

  if (columnCount < 2) {
    // Header too sparse to be authoritative. Try the separator, then the
    // smallest data-line count.
    if (separatorIndices.length > 0) {
      columnCount = splitCells(blockLines[separatorIndices[0]]).length;
    } else {
      const dataCellCounts = dataIndices.map((index) =>
        nonEmptyCount(splitCells(blockLines[index])),
      );

      columnCount =
        dataCellCounts.length > 0 ? Math.min(...dataCellCounts) : 0;
    }
  }

  if (columnCount < 2) {
    return blockLines;
  }

  const header = formatRow(headerCells);

  const separator =
    separatorIndices.length > 0
      ? blockLines[separatorIndices[0]]
      : mergedSeparator !== null
        ? mergedSeparator
        : formatSeparator(columnCount);

  const dataRows: string[] = [];

  for (const index of dataIndices) {
    if (index === headerIndex) {
      continue;
    }

    // A data line can carry the same merged-separator artifact.
    const dataSplit = splitTrailingSeparator(blockLines[index]);

    const cells = dataSplit
      ? dataSplit.cells
      : stripEmptyBoundary(splitCells(blockLines[index]));

    for (const row of reChunkCells(cells, columnCount)) {
      dataRows.push(row);
    }
  }

  return [header, separator, ...dataRows];
};

/**
 * Normalizes broken pipe-table inputs in assistant markdown text. Returns
 * the input unchanged when no candidate table block is found. Used as a
 * pre-pass before `react-markdown` (with `remark-gfm`) so the transcript
 * can render pipe grids the assistant emitted without a separator row or
 * with several rows collapsed onto one line.
 */
export const repairTables = (markdown: string): string => {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];

  let i = 0;
  let inFence = false;
  let fenceChar = '';
  let fenceLen = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);

    if (fenceMatch) {
      const char = fenceMatch[1][0];
      const len = fenceMatch[1].length;

      if (!inFence) {
        inFence = true;
        fenceChar = char;
        fenceLen = len;
      } else if (char === fenceChar && len >= fenceLen) {
        inFence = false;
      }

      output.push(line);
      i++;

      continue;
    }

    if (inFence) {
      output.push(line);
      i++;

      continue;
    }

    let j = i;

    while (
      j < lines.length &&
      lines[j].trim() !== '' &&
      isTableLine(lines[j])
    ) {
      j++;
    }

    if (j === i) {
      // The current line is non-blank but not a table candidate; pass it
      // through verbatim and step past it.
      output.push(lines[i]);
      i++;

      continue;
    }

    const block = lines.slice(i, j);

    const blockHasData = block.some((entry) => !isSeparatorLine(entry));

    if (blockHasData) {
      output.push(...repairBlock(block));
    } else {
      output.push(...block);
    }

    i = j;
  }

  return output.join('\n');
};