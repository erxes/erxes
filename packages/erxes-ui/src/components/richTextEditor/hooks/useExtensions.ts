import { Document } from '@tiptap/extension-document';
import { EditorOptions } from '@tiptap/core';
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
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Heading } from '@tiptap/extension-heading';
import CharacterCount from '@tiptap/extension-character-count';
import { useMemo } from 'react';
import {
  FontSize,
  MentionExtended,
  TableImproved,
  Cell as TableCell,
  Row as TableRow,
  Header as TableHeader,
  ImageResize,
  GlobalAttributes,
} from '../extensions';

import { DivNode } from '../nodes';
import { SpanMark } from '../marks';
import {
  MentionSuggestionParams,
  getMentionSuggestions,
} from '../utils/getMentionSuggestions';
import { generateJSON } from '@tiptap/html';

export type UseExtensionsOptions = {
  /** Placeholder hint to show in the text input area before a user types a message. */
  placeholder?: string;

  showMentions?: boolean;

  mentionSuggestion?: MentionSuggestionParams;

  /** Character count limit. */
  limit?: number;
};

// Don't treat the end cursor as "inclusive" of the Link mark, so that users can
// actually "exit" a link if it's the last element in the editor (see
// https://tiptap.dev/api/schema#inclusive and
// https://github.com/ueberdosis/tiptap/issues/2572#issuecomment-1055827817).
// This also makes the `isActive` behavior somewhat more consistent with
// `extendMarkRange` (as described here
// https://github.com/ueberdosis/tiptap/issues/2535), since a link won't be
// treated as active if the cursor is at the end of the link. One caveat of this
// approach: it seems that after creating or editing a link with the link menu
// (as opposed to having a link created via autolink), the next typed character
// will be part of the link unexpectedly, and subsequent characters will not be.
// This may have to do with how we're using `insertContent` and `setLink` in
// the LinkBubbleMenu, but I can't figure out an alternative approach that
// avoids the issue. This is arguably better than being "stuck" in the link
// without being able to leave it, but it is still not quite right. See the
// related open issues here:
// https://github.com/ueberdosis/tiptap/issues/2571,
// https://github.com/ueberdosis/tiptap/issues/2572, and
// https://github.com/ueberdosis/tiptap/issues/514
const CustomLinkExtension = Link.extend({
  inclusive: false,
  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
      rel: {
        default: this.options.HTMLAttributes.rel,
      },
      style: {
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
});
// Make subscript and superscript mutually exclusive
// https://github.com/ueberdosis/tiptap/pull/1436#issuecomment-1031937768

/// @later config these
const CustomSubscript = Subscript.extend({
  excludes: 'superscript',
});

const CustomSuperscript = Superscript.extend({
  excludes: 'subscript',
});

/**
 * A hook for providing a default set of useful extensions for the editor.
 */
export default function useExtensions({
  placeholder,
  showMentions,
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
          };
        },
      }),
      DivNode,
      SpanMark,
      CustomLinkExtension.configure({
        // autolink is generally useful for changing text into links if they
        // appear to be URLs (like someone types in literally "example.com"),
        // though it comes with the caveat that if you then *remove* the link
        // from the text, and then add a space or newline directly after the
        // text, autolink will turn the text back into a link again. Not ideal,
        // but probably still overall worth having autolink enabled, and that's
        // how a lot of other tools behave as well.
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
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

      CustomSubscript,
      CustomSuperscript,

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

      ...(showMentions && mentionSuggestion
        ? [
            MentionExtended.configure({
              renderLabel({ options, node }) {
                return `${options.suggestion.char}${
                  node.attrs.label ?? node.attrs.id
                }`;
              },
              suggestion: getMentionSuggestions(mentionSuggestion),
            }),
          ]
        : []),
      CharacterCount.configure({
        limit,
      }),
      Placeholder.configure({
        placeholder,
      }),
      GlobalAttributes,
    ],
    [showMentions]
  );
}

export function useGenerateJSON(html: string) {
  return generateJSON(html, [
    TableImproved,
    TableRow,
    TableHeader,
    TableCell,
    Document,
    BulletList,
    CodeBlock,
    HardBreak,
    ListItem,
    OrderedList,
    Paragraph,
    CustomSubscript,
    CustomSuperscript,
    Text,
    Bold,
    Blockquote,
    Code,
    Italic,
    Underline,
    ImageResize,
    Strike,
    CustomLinkExtension,
    Gapcursor,
    TextAlign,
    Color,
    FontFamily,
    Highlight,
    HorizontalRule,
    Dropcursor,
    Heading,
    History,
    FontSize,
    DivNode,
    MentionExtended,
    SpanMark,
    CharacterCount,
    Placeholder,
  ]);
}
