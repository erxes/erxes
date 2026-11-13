import type { ReactCustomBlockRenderProps } from '@blocknote/react';

export const galleryBlockConfig = {
  type: 'gallery' as const,
  propSchema: {
    // JSON array of { url, caption? }; see utils/galleryImages.
    images: {
      default: '[]' as string,
    },
    columns: {
      default: '3' as string,
    },
  },
  content: 'none' as const,
};

export type GalleryRenderProps = ReactCustomBlockRenderProps<typeof galleryBlockConfig>;
