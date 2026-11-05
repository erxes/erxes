import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { useMemo } from 'react';

import type { IMdInline, MdBlock } from './mdBlocks';
import { parseMarkdownBlocks } from './mdBlocks';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111827',
    gap: 6,
  },
  heading1: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginTop: 8 },
  heading2: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginTop: 8 },
  heading3: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  heading4: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  heading5: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  heading6: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  paragraph: { lineHeight: 1.5 },
  listItem: { flexDirection: 'row', paddingLeft: 10, gap: 4 },
  listMarker: { width: 14 },
  listText: { flex: 1, lineHeight: 1.4 },
  code: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    backgroundColor: '#F3F4F6',
    padding: 8,
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: '#D1D5DB',
    paddingLeft: 10,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  table: { borderWidth: 1, borderColor: '#D1D5DB' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#D1D5DB',
  },
  headerRow: { backgroundColor: '#F3F4F6' },
  headerCell: { fontFamily: 'Helvetica-Bold' },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },
  boldItalic: { fontFamily: 'Helvetica-BoldOblique' },
  inlineCode: { fontFamily: 'Courier', fontSize: 10 },
  hr: { borderBottomWidth: 1, borderColor: '#D1D5DB', marginVertical: 8 },
});

type PdfStyles = typeof styles;

const HEADING_STYLE: Record<number, keyof PdfStyles> = {
  1: 'heading1',
  2: 'heading2',
  3: 'heading3',
  4: 'heading4',
  5: 'heading5',
  6: 'heading6',
};

const inlineStyles = (inline: IMdInline): PdfStyles[keyof PdfStyles][] => {
  const applied: PdfStyles[keyof PdfStyles][] = [];

  if (inline.bold && inline.italic) {
    applied.push(styles.boldItalic);
  } else {
    if (inline.bold) {
      applied.push(styles.bold);
    }
    if (inline.italic) {
      applied.push(styles.italic);
    }
  }

  if (inline.code) {
    applied.push(styles.inlineCode);
  }

  return applied;
};

const InlineText = ({ inlines }: { inlines: IMdInline[] }) => (
  <>
    {inlines.map((inline, index) => (
      <Text key={index} style={inlineStyles(inline)}>
        {inline.text}
      </Text>
    ))}
  </>
);

const PdfBlock = ({ block }: { block: MdBlock }) => {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={styles[HEADING_STYLE[block.level]]}>
          <InlineText inlines={block.inlines} />
        </Text>
      );
    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          <InlineText inlines={block.inlines} />
        </Text>
      );
    case 'list':
      return (
        <>
          {block.items.map((inlines, index) => (
            <View key={index} style={styles.listItem} wrap={false}>
              <Text style={styles.listMarker}>
                {block.ordered ? `${index + 1}.` : '•'}
              </Text>
              <Text style={styles.listText}>
                <InlineText inlines={inlines} />
              </Text>
            </View>
          ))}
        </>
      );
    case 'code':
      return (
        <View style={styles.code}>
          {block.text.split('\n').map((line, index) => (
            <Text key={index}>{line === '' ? ' ' : line}</Text>
          ))}
        </View>
      );
    case 'quote':
      return (
        <Text style={styles.quote}>
          <InlineText inlines={block.inlines} />
        </Text>
      );
    case 'table':
      return (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.headerRow]}>
            {block.header.map((cell, index) => (
              <Text key={index} style={[styles.tableCell, styles.headerCell]}>
                {cell}
              </Text>
            ))}
          </View>
          {block.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((cell, index) => (
                <Text key={index} style={styles.tableCell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case 'hr':
      return <View style={styles.hr} />;
  }
};

const MarkdownPdf = ({ markdown }: { markdown: string }) => {
  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map((block, index) => (
          <PdfBlock key={index} block={block} />
        ))}
      </Page>
    </Document>
  );
};

/**
 * Renders the supported markdown subset onto built-in PDF fonts only
 * (Helvetica/Courier families), so no font asset is fetched at generation
 * time. Returns a Blob for inline preview and download.
 */
export const markdownToPdfBlob = async (markdown: string): Promise<Blob> => {
  const { pdf } = await import('@react-pdf/renderer');

  return pdf(<MarkdownPdf markdown={markdown} />).toBlob();
};
