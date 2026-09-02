import type { PayloadValue } from '@maily-to/render';
import type { JSONContent } from '@tiptap/core';

export type { JSONContent };

export interface RenderEmailHtmlOptions {
  /** Resolved variable values for this recipient, keyed by variable name/id. */
  variables?: Record<string, string>;
  /** Payload values for Repeat/Show If blocks, keyed by payload key. */
  payloads?: Record<string, PayloadValue>;
}
