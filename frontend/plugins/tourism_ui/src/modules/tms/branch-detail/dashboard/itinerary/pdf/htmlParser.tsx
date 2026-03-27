import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { COLORS } from './styles';

interface ParsedNode {
  type: 'text' | 'bold' | 'break';
  content: string;
}

interface ParsedParagraph {
  alignment: 'left' | 'center' | 'right' | 'justify';
  nodes: ParsedNode[];
}

const BASE_STYLE = {
  fontSize: 9,
  color: COLORS.text,
  lineHeight: 1.7,
  fontFamily: 'Helvetica',
} as const;

const BOLD_STYLE = {
  fontFamily: 'Helvetica-Bold' as const,
};

const PARAGRAPH_SPACING = {
  marginBottom: 6,
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
      const boldText = match[2]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      if (boldText) {
        nodes.push({ type: 'bold', content: boldText });
      }
    } else if (match[0].match(/^<br\s*\/?>/i)) {
      nodes.push({ type: 'break', content: '\n' });
    } else if (match[3]) {
      // Plain text
      const text = match[3]
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      if (text.trim()) {
        nodes.push({ type: 'text', content: text });
      }
    }
  }

  return nodes;
};

const parseParagraphs = (html: string): ParsedParagraph[] => {
  const paragraphs: ParsedParagraph[] = [];

  // Match <p ...>content</p> blocks
  const pRegex = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = pRegex.exec(html)) !== null) {
    // Capture any text between paragraphs
    if (match.index > lastIndex) {
      const between = html.slice(lastIndex, match.index).trim();
      if (between) {
        const nodes = parseInlineNodes(between);
        if (nodes.length > 0) {
          paragraphs.push({ alignment: 'center', nodes });
        }
      }
    }
    lastIndex = pRegex.lastIndex;

    const attrs = match[1];
    const innerHtml = match[2];

    const alignment = extractAlignment(attrs);
    const nodes = parseInlineNodes(innerHtml);

    // Skip empty paragraphs
    const hasContent = nodes.some((n) => n.content.trim().length > 0);
    if (hasContent) {
      paragraphs.push({ alignment, nodes });
    }
  }

  // Handle remaining text after last </p>
  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex).trim();
    if (remaining) {
      const nodes = parseInlineNodes(remaining);
      if (nodes.length > 0) {
        paragraphs.push({ alignment: 'center', nodes });
      }
    }
  }

  // If no <p> found, treat the whole string as one paragraph
  if (paragraphs.length === 0 && html.trim()) {
    const nodes = parseInlineNodes(html);
    if (nodes.length > 0) {
      paragraphs.push({ alignment: 'center', nodes });
    }
  }

  return paragraphs;
};

/**
 * Parses HTML content into react-pdf <Text>/<View> elements.
 * Supports <p>, <strong>/<b>, <br>, and data-text-alignment.
 */
export const parseHtmlToPdfElements = (html: string): React.ReactNode[] => {
  if (!html || !html.trim()) return [];

  const paragraphs = parseParagraphs(html);

  return paragraphs.map((para, pIdx) => (
    <View key={`p-${pIdx}`} style={PARAGRAPH_SPACING}>
      <Text style={[BASE_STYLE, { textAlign: para.alignment }]}>
        {para.nodes.map((node, nIdx) => {
          if (node.type === 'break') {
            return <Text key={`n-${pIdx}-${nIdx}`}>{'\n'}</Text>;
          }
          if (node.type === 'bold') {
            return (
              <Text key={`n-${pIdx}-${nIdx}`} style={BOLD_STYLE}>
                {node.content}
              </Text>
            );
          }
          return <Text key={`n-${pIdx}-${nIdx}`}>{node.content}</Text>;
        })}
      </Text>
    </View>
  ));
};
