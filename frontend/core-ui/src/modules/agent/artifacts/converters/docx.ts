import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

import type { IMdInline, MdBlock } from './mdBlocks';
import { parseMarkdownBlocks } from './mdBlocks';

const MONO_FONT = 'Courier New';
const BORDER_COLOR = 'D4D4D8';

const headingLevel = (level: number) => {
  switch (level) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    case 5:
      return HeadingLevel.HEADING_5;
    default:
      return HeadingLevel.HEADING_6;
  }
};

const toRuns = (inlines: IMdInline[]): TextRun[] =>
  inlines.map((inline) =>
    new TextRun({
      text: inline.text,
      bold: inline.bold,
      italics: inline.italic,
      font: inline.code ? MONO_FONT : undefined,
    }),
  );

const toCodeParagraphs = (text: string): Paragraph[] =>
  text.split('\n').map((line) =>
    new Paragraph({
      children: [new TextRun({ text: line, font: MONO_FONT, size: 20 })],
      spacing: { after: 0 },
    }),
  );

const toQuoteParagraph = (inlines: IMdInline[]): Paragraph =>
  new Paragraph({
    children: toRuns(inlines),
    indent: { left: 360 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: BORDER_COLOR },
    },
    spacing: { before: 60, after: 60 },
  });

const toHrParagraph = (): Paragraph =>
  new Paragraph({
    children: [],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
    },
    spacing: { before: 120, after: 120 },
  });

const toTable = (header: string[], rows: string[][]): Table => {
  const border = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: BORDER_COLOR,
  };
  const cell = (text: string, bold: boolean) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((text) => cell(text, true)),
      }),
      ...rows.map((row) => new TableRow({ children: row.map((text) => cell(text, false)) })),
    ],
  });
};

const toDocxElements = (block: MdBlock): (Paragraph | Table)[] => {
  switch (block.type) {
    case 'heading':
      return [
        new Paragraph({
          children: toRuns(block.inlines),
          heading: headingLevel(block.level),
        }),
      ];
    case 'paragraph':
      return [new Paragraph({ children: toRuns(block.inlines) })];
    case 'list':
      return block.items.map((inlines, index) =>
        new Paragraph({
          children: [
            new TextRun({ text: block.ordered ? `${index + 1}. ` : '• ' }),
            ...toRuns(inlines),
          ],
          indent: { left: 360 },
          spacing: { after: 40 },
        }),
      );
    case 'code':
      return toCodeParagraphs(block.text);
    case 'quote':
      return [toQuoteParagraph(block.inlines)];
    case 'table':
      return [toTable(block.header, block.rows)];
    case 'hr':
      return [toHrParagraph()];
  }
};

/**
 * Builds a standard, fully editable Word document: every block maps to a
 * native OOXML element (styled headings, real tables, formatted runs) so the
 * generated file opens editable in Word, Google Docs, and Pages.
 */
export const markdownToDocxBlob = async (markdown: string): Promise<Blob> => {
  const blocks = parseMarkdownBlocks(markdown);
  const children = blocks.flatMap(toDocxElements);

  const document = new Document({
    sections: [
      { children: children.length ? children : [new Paragraph({})] },
    ],
  });

  return Packer.toBlob(document);
};
