import { BlockNoteEditor } from '@blocknote/core';
import { withFieldSpans } from './fields';
import { BODY_SCHEMA, type BodyEditor } from './schema';

/** A broadcast's stored Markdown as the editor's blocks, fields as chips. */
export const markdownToBlocks = (markdown: string) =>
  BlockNoteEditor.create({ schema: BODY_SCHEMA }).tryParseMarkdownToBlocks(
    withFieldSpans(markdown),
  );

/** What the editor holds, as the Markdown core sends; fields as `{{ name }}`. */
export const blocksToMarkdown = (editor: BodyEditor) =>
  editor.blocksToMarkdownLossy(editor.document).trim();
