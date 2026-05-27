import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { COLORS } from './styles';
import { PDF_FONT_FAMILY } from './fonts';
import { stripHtml } from './utils';

interface ParsedNode {
  type: 'text' | 'bold' | 'break';
  content: string;
}

type TextAlignment = 'left' | 'center' | 'right' | 'justify';

interface ParseHtmlToPdfOptions {
  defaultAlignment?: TextAlignment;
  forceAlignment?: TextAlignment;
}

interface ParsedParagraph {
  alignment: TextAlignment;
  nodes: ParsedNode[];
}

const BASE_STYLE = {
  fontSize: 9,
  color: COLORS.text,
  lineHeight: 1.7,
  fontFamily: PDF_FONT_FAMILY,
} as const;

const BOLD_STYLE = {
  fontFamily: PDF_FONT_FAMILY,
  fontWeight: 'bold' as const,
};

const PARAGRAPH_SPACING = {
  marginBottom: 6,
};

const INLINE_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const INLINE_ENTITY_REGEX = new RegExp(
  Object.keys(INLINE_ENTITIES).join('|'),
  'gi',
);

const decodeEntities = (text: string): string =>
  text.replaceAll(
    INLINE_ENTITY_REGEX,
    (m) => INLINE_ENTITIES[m.toLowerCase()] || m,
  );

const stripTags = (text: string): string => {
  let result = text;
  let prev;
  do {
    prev = result;
    result = result.replaceAll(/<[^>]*>/g, '');
  } while (result !== prev);
  return result.replaceAll(/<[a-z][\s\S]*/gi, '');
};

const extractAlignment = (
  tag: string,
): 'left' | 'center' | 'right' | 'justify' => {
  const match = tag.match(/data-text-alignment="(left|center|right|justify)"/i);
  return (match?.[1] as 'left' | 'center' | 'right' | 'justify') || 'center';
};

const parseInlineNodes = (html: string): ParsedNode[] => {
  const nodes: ParsedNode[] = [];
  const regex = /<(strong|b)>([\s\S]*?)<\/\1>|<br\s*\/?>|([^<]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      // <strong> or <b>
      const boldText = decodeEntities(
        stripTags(match[2].replaceAll(/<br\s*\/?>/gi, '\n')),
      );
      if (boldText) {
        nodes.push({ type: 'bold', content: boldText });
      }
    } else if (/^<br\s*\/?>/i.test(match[0])) {
      nodes.push({ type: 'break', content: '\n' });
    } else if (match[3]) {
      // Plain text
      const text = decodeEntities(match[3]);
      if (text.length > 0) {
        nodes.push({ type: 'text', content: text });
      }
    }
  }

  return nodes;
};

const pushIfNonEmpty = (
  paragraphs: ParsedParagraph[],
  text: string,
  alignment: ParsedParagraph['alignment'] = 'center',
): void => {
  const nodes = parseInlineNodes(text);
  if (nodes.length > 0) {
    paragraphs.push({ alignment, nodes });
  }
};

const parseParagraphs = (
  html: string,
  defaultAlignment: TextAlignment,
  forceAlignment?: TextAlignment,
): ParsedParagraph[] => {
  const paragraphs: ParsedParagraph[] = [];

  const pRegex = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = pRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const between = html.slice(lastIndex, match.index).trim();
      if (between) pushIfNonEmpty(paragraphs, between, defaultAlignment);
    }
    lastIndex = pRegex.lastIndex;

    const alignment = forceAlignment || extractAlignment(match[1]);
    const nodes = parseInlineNodes(match[2]);
    const hasContent = nodes.some((n) => n.content.trim().length > 0);
    if (hasContent) {
      paragraphs.push({ alignment, nodes });
    }
  }

  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex).trim();
    if (remaining) pushIfNonEmpty(paragraphs, remaining, defaultAlignment);
  }

  if (paragraphs.length === 0 && html.trim()) {
    pushIfNonEmpty(paragraphs, html, defaultAlignment);
  }

  return paragraphs;
};

/**
 * Parses HTML content into react-pdf <Text>/<View> elements.
 * Supports <p>, <strong>/<b>, <br>, and data-text-alignment.
 */
export const parseHtmlToPdfElements = (
  html: string,
  options?: ParseHtmlToPdfOptions,
): React.ReactNode[] => {
  if (!html?.trim()) return [];

  try {
    const paragraphs = parseParagraphs(
      html,
      options?.defaultAlignment || 'center',
      options?.forceAlignment,
    );

    return paragraphs.map((para, pIdx) => (
      <View key={`p-${pIdx}-${para.alignment}`} style={PARAGRAPH_SPACING}>
        <Text style={[BASE_STYLE, { textAlign: para.alignment }]}>
          {para.nodes.map((node, nIdx) => {
            const key = `p${pIdx}-n${nIdx}`;
            if (node.type === 'break') {
              return <Text key={key}>{'\n'}</Text>;
            }
            if (node.type === 'bold') {
              return (
                <Text key={key} style={BOLD_STYLE}>
                  {node.content}
                </Text>
              );
            }
            return <Text key={key}>{node.content}</Text>;
          })}
        </Text>
      </View>
    ));
  } catch {
    return [
      <Text
        key="fallback"
        style={[
          BASE_STYLE,
          {
            textAlign:
              options?.forceAlignment || options?.defaultAlignment || 'center',
          },
        ]}
      >
        {stripHtml(html)}
      </Text>,
    ];
  }
};
