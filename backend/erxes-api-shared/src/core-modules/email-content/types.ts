import { EMAIL_CONTENT_FORMATS } from './constants';
import type { TBlocksToHtmlConfig } from './blocksToHtml';
import type { TPlaceholderResolver } from './replacePlaceholders';

export type TEmailContentFormat =
  (typeof EMAIL_CONTENT_FORMATS)[keyof typeof EMAIL_CONTENT_FORMATS];

/**
 * An email body as it is sent. `blocks` content is a serialized block
 * document; `maily` content is the html the email editor rendered, with its
 * fields left as `{{ … }}` placeholders. Which one it is is said outright
 * rather than guessed from which field happens to be set.
 */
export type TEmailContent = {
  content?: string;
  contentJson?: Record<string, unknown>;
  contentFormat?: TEmailContentFormat;
};

/** Whether the record being rendered for had something for this field. */
export type TEmailFieldOutcome = { id: string; filled: boolean };

export type TRenderEmailContentOptions = {
  /** Where each placeholder's value comes from, asked in order. */
  resolvers?: TPlaceholderResolver[];
  /**
   * Block content keeps its placeholders as nodes of its own document format,
   * so the module that owns that format substitutes them before rendering.
   */
  replaceBlocks?: (content: string) => Promise<string> | string;
  /** Footer the recipient is owed, in whichever shape the format needs. */
  unsubscribeUrl?: string;
  postalAddress?: string;
  blocksConfig?: TBlocksToHtmlConfig;
  /**
   * Told once per render which fields the record answered and which it did
   * not — the only moment both are known together.
   */
  onFields?: (fields: TEmailFieldOutcome[]) => void;
  /**
   * Preview only. A field the record has nothing for is rendered as its own
   * name instead of as nothing, because a preview that shows a gap silently
   * cannot be told apart from one that is working.
   */
  markMissing?: boolean;
};
