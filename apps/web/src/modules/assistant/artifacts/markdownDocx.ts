import {
  AlignmentType,
  BorderStyle,
  Document,
  Table as DocxTable,
  ExternalHyperlink,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  type ParagraphChild,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { List, PhrasingContent, RootContent, Table } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  font?: string;
  style?: string;
}

type Block = Paragraph | DocxTable;

const MONO = 'Consolas';

const ORDERED = 'ordered';

const QUOTE_INDENT = 567;

const HEADINGS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
] as const;

const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

const isOutsideLink = (url: string) => URL.canParse(url) && LINK_SCHEMES.has(new URL(url).protocol);

const runsOf = (nodes: PhrasingContent[], style: RunStyle = {}): ParagraphChild[] =>
  nodes.flatMap((node): ParagraphChild[] => {
    switch (node.type) {
      case 'text':
        return [new TextRun({ text: node.value, ...style })];
      case 'strong':
        return runsOf(node.children, { ...style, bold: true });
      case 'emphasis':
        return runsOf(node.children, { ...style, italics: true });
      case 'delete':
        return runsOf(node.children, { ...style, strike: true });
      case 'inlineCode':
        return [new TextRun({ text: node.value, ...style, font: MONO })];
      case 'break':
        return [new TextRun({ break: 1 })];
      case 'link':
        return isOutsideLink(node.url)
          ? [
              new ExternalHyperlink({
                link: node.url,
                children: runsOf(node.children, { ...style, style: 'Hyperlink' }),
              }),
            ]
          : runsOf(node.children, style);
      default:
        return [];
    }
  });

const tableOf = (table: Table) =>
  new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: table.children.map(
      (row, index) =>
        new TableRow({
          tableHeader: index === 0,
          children: row.children.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({ children: runsOf(cell.children, { bold: index === 0 }) }),
                ],
              }),
          ),
        }),
    ),
  });

const listOf = (list: List, level: number): Block[] =>
  list.children.flatMap((item) =>
    item.children.flatMap((child, index): Block[] => {
      if (child.type === 'list') return listOf(child, level + 1);

      if (child.type !== 'paragraph' || index > 0) return blocksOf([child], level + 1);

      const marker = list.ordered
        ? {
            numbering: {
              reference: ORDERED,
              level,
              instance: list.position?.start.offset ?? 0,
            },
          }
        : { bullet: { level } };

      return [new Paragraph({ children: runsOf(child.children), ...marker })];
    }),
  );

const blockOf = (node: RootContent, level: number): Block[] => {
  switch (node.type) {
    case 'heading':
      return [
        new Paragraph({ heading: HEADINGS[node.depth - 1], children: runsOf(node.children) }),
      ];
    case 'paragraph':
      return [
        new Paragraph({ children: runsOf(node.children), indent: { left: level * QUOTE_INDENT } }),
      ];
    case 'list':
      return listOf(node, 0);
    case 'blockquote':
      return blocksOf(node.children, level + 1);
    case 'code':
      return node.value
        .split('\n')
        .map((line) => new Paragraph({ children: [new TextRun({ text: line, font: MONO })] }));
    case 'table':
      return [tableOf(node), new Paragraph({})];
    case 'thematicBreak':
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto', space: 1 } },
        }),
      ];
    default:
      return [];
  }
};

function blocksOf(nodes: RootContent[], level = 0): Block[] {
  return nodes.flatMap((node) => blockOf(node, level));
}

const NUMBERING = {
  config: [
    {
      reference: ORDERED,
      levels: [0, 1, 2, 3, 4, 5].map((level) => ({
        level,
        format: LevelFormat.DECIMAL,
        text: `%${level + 1}.`,
        alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
      })),
    },
  ],
};

export const markdownToDocx = (title: string, markdown: string) => {
  const root = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  return Packer.toBlob(
    new Document({
      title,
      numbering: NUMBERING,
      sections: [{ children: blocksOf(root.children) }],
    }),
  );
};
