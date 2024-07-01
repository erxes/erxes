import { useMemo } from 'react';
import { Document } from '@tiptap/extension-document';
import { EditorOptions, JSONContent } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Color } from '@tiptap/extension-color';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { FontFamily } from '@tiptap/extension-font-family';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Highlight } from '@tiptap/extension-highlight';
import { History } from '@tiptap/extension-history';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Heading } from '@tiptap/extension-heading';
import CharacterCount from '@tiptap/extension-character-count';
import {
  FontSize,
  TableImproved,
  Cell as TableCell,
  Row as TableRow,
  Header as TableHeader,
  ImageResize,
  GlobalAttributes,
  Link,
  Subscript,
  Superscript,
  Mention,
} from '../extensions';

import { DivNode } from '../nodes';
import { SpanMark } from '../marks';
import {
  MentionSuggestionParams,
  getMentionSuggestions,
} from '../utils/getMentionSuggestions';
import { generateJSON, generateHTML as generateHTMLTiptap } from '@tiptap/html';
export type UseExtensionsOptions = {
  /** Placeholder hint to show in the text input area before a user types a message. */
  placeholder?: string;
  mentionSuggestion?: MentionSuggestionParams;
  /** Character count limit. */
  limit?: number;
};

/**
 * A hook for providing a default set of useful extensions for the editor.
 */
export default function useExtensions({
  placeholder,
  mentionSuggestion,
  limit,
}: UseExtensionsOptions = {}): EditorOptions['extensions'] {
  return useMemo(
    () => [
      Document,
      Paragraph.extend({
        addAttributes() {
          return {
            style: {
              parseHTML: (element) => element.getAttribute('style'),
            },
          };
        },
      }),
      Text,
      Heading.extend({
        addAttributes() {
          return {
            style: {
              parseHTML: (element) => element.getAttribute('style'),
            },
            level: {
              default: 1,
              rendered: false,
            },
          };
        },
      }),
      DivNode,
      SpanMark,
      Link,
      FontSize,
      FontFamily,
      TableImproved,
      TableCell,
      TableHeader,
      TableRow,
      BulletList,
      CodeBlock,
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            // ctrl + enter [Win] = cmd + enter [macOS]
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
            'Mod-Enter': () => false,
            'Control-Enter': () => false,
          };
        },
      }),
      ListItem,
      OrderedList,
      Subscript,
      Superscript,
      Bold,
      Blockquote,
      Code,
      Italic,
      Underline,
      ImageResize.configure({
        inline: true,
        allowBase64: true,
      }),
      Strike,
      Gapcursor,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Color,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      Dropcursor,
      History,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion:
          mentionSuggestion && getMentionSuggestions(mentionSuggestion),
      }),
      CharacterCount.configure({
        limit,
      }),
      Placeholder.configure({
        placeholder,
      }),
      GlobalAttributes,
    ],
    [],
  );
}
export function useGenerateJSON(html: string) {
  return generateJSON(html, [
    Document,
    Paragraph.extend({
      addAttributes() {
        return {
          style: {
            parseHTML: (element) => element.getAttribute('style'),
          },
        };
      },
    }),
    Text,
    Heading.extend({
      addAttributes() {
        return {
          style: {
            parseHTML: (element) => element.getAttribute('style'),
          },
        };
      },
    }),
    DivNode,
    SpanMark,
    Link,
    FontSize,
    FontFamily,
    TableImproved,
    TableCell,
    TableHeader,
    TableRow,
    BulletList,
    CodeBlock,
    HardBreak.extend({
      addKeyboardShortcuts() {
        return {
          // ctrl + enter [Win] = cmd + enter [macOS]
          'Shift-Enter': () => this.editor.commands.setHardBreak(),
          'Mod-Enter': () => false,
          'Control-Enter': () => false,
        };
      },
    }),
    ListItem,
    OrderedList,
    Subscript,
    Superscript,
    Bold,
    Blockquote,
    Code,
    Italic,
    Underline,
    ImageResize.configure({
      inline: true,
      allowBase64: true,
    }),
    Strike,
    Gapcursor,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
    }),
    Color,
    Highlight.configure({ multicolor: true }),
    HorizontalRule,
    Dropcursor,
    History,
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
    }),
    CharacterCount,
    Placeholder,
    GlobalAttributes,
  ]);
}

export function generateHTML(json: JSONContent) {
  return generateHTMLTiptap(json, [
    Document,
    Paragraph.extend({
      addAttributes() {
        return {
          style: {
            parseHTML: (element) => element.getAttribute('style'),
          },
        };
      },
    }),
    Text,
    Heading.extend({
      addAttributes() {
        return {
          style: {
            parseHTML: (element) => element.getAttribute('style'),
          },
        };
      },
    }),
    DivNode,
    SpanMark,
    Link,
    FontSize,
    FontFamily,
    TableImproved,
    TableCell,
    TableHeader,
    TableRow,
    BulletList,
    CodeBlock,
    HardBreak.extend({
      addKeyboardShortcuts() {
        return {
          // ctrl + enter [Win] = cmd + enter [macOS]
          'Shift-Enter': () => this.editor.commands.setHardBreak(),
          'Mod-Enter': () => false,
          'Control-Enter': () => false,
        };
      },
    }),
    ListItem,
    OrderedList,
    Subscript,
    Superscript,
    Bold,
    Blockquote,
    Code,
    Italic,
    Underline,
    ImageResize.configure({
      inline: true,
      allowBase64: true,
    }),
    Strike,
    Gapcursor,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
    }),
    Color,
    Highlight.configure({ multicolor: true }),
    HorizontalRule,
    Dropcursor,
    History,
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
    }),
    CharacterCount,
    Placeholder,
    GlobalAttributes,
  ]);
}
