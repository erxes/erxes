import { fileBlockConfig } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { CustomFileBlockContent } from './CustomFileBlockContent';

export const customFileBlock = createReactBlockSpec(fileBlockConfig, {
  render: CustomFileBlockContent,
});
