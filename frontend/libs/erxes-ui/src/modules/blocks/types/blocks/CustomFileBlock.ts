import type {
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  fileBlockConfig,
} from '@blocknote/core';
import type {
  FileBlockWrapper,
  ReactCustomBlockRenderProps,
} from '@blocknote/react';

export type FileRenderProps = ReactCustomBlockRenderProps<
  typeof fileBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

type FileBlockWrapperProps = Parameters<typeof FileBlockWrapper>[0];
export type FileWrapperRenderProps = Omit<
  FileBlockWrapperProps,
  'buttonText' | 'buttonIcon' | 'children'
>;
