import type { PayloadValue } from '@maily-to/render';
import type { JSONContent } from '@tiptap/core';

export type { JSONContent };

export interface RenderEmailHtmlOptions {
  variables?: Record<string, string>;
  payloads?: Record<string, PayloadValue>;
  previewText?: string;
}
