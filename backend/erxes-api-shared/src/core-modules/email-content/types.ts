import type { PayloadValue } from '@maily-to/render';
import type { JSONContent } from '@tiptap/core';
import { EMAIL_CONTENT_FORMATS } from './constants';
import type { TBlocksToHtmlConfig } from './blocksToHtml';

export type { JSONContent };

export type TEmailContentFormat =
  (typeof EMAIL_CONTENT_FORMATS)[keyof typeof EMAIL_CONTENT_FORMATS];

/**
 * An email body as it is stored. `blocks` content is a serialized block
 * document; `maily` content is the email editor's own JSON. Which one it is
 * is said outright rather than guessed from which field happens to be set.
 */
export type TEmailContent = {
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: TEmailContentFormat;
  previewText?: string;
};

export type TRenderMailyOptions = {
  variables?: Record<string, string>;
  payloads?: Record<string, PayloadValue>;
  previewText?: string;
};

export type TRenderEmailContentOptions = {
  /** The record whose values fill the placeholders. */
  replacer?: Record<string, any>;
  /** Lists a repeated block walks, keyed by what the block repeats over. */
  payloads?: Record<string, PayloadValue>;
  /**
   * Block content keeps its placeholders as nodes of its own document format,
   * so the module that owns that format substitutes them before rendering.
   */
  replaceBlocks?: (content: string) => Promise<string> | string;
  /** Footer the recipient is owed, in whichever shape the format needs. */
  unsubscribeUrl?: string;
  postalAddress?: string;
  blocksConfig?: TBlocksToHtmlConfig;
};
