import { createImageBlockConfig } from '@blocknote/core';
import type { ReactCustomBlockRenderProps } from '@blocknote/react';

const IMAGE_STYLES = ['normal', 'wide', 'float-left', 'float-right'] as const;

export type ImageStyle = (typeof IMAGE_STYLES)[number];

export const IMAGE_STYLE_PRESETS: Record<
  ImageStyle,
  {
    previewWidth: number;
    maxWidth: number;
  }
> = {
  normal: { previewWidth: 480, maxWidth: 480 },
  wide: { previewWidth: 720, maxWidth: 720 },
  'float-left': { previewWidth: 300, maxWidth: 400 },
  'float-right': { previewWidth: 300, maxWidth: 400 },
};

export const getImageStyle = (value?: string): ImageStyle =>
  IMAGE_STYLES.find((style) => style === value) ?? 'normal';

const imageBlockConfig = createImageBlockConfig({});

export const customImageBlockConfig = {
  ...imageBlockConfig,
  propSchema: {
    ...imageBlockConfig.propSchema,
    imageStyle: {
      default: 'normal' as const,
      values: IMAGE_STYLES,
    },
  },
};

export type ImageRenderProps = ReactCustomBlockRenderProps<typeof customImageBlockConfig>;
