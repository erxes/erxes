import { createReactBlockSpec } from '@blocknote/react';
import { galleryBlockConfig } from 'erxes-ui/modules/blocks/constant/galleryBlockConfig';
import type { GalleryImage } from 'erxes-ui/modules/blocks/utils/galleryImages';
import { GalleryBlockContent } from './GalleryBlockContent';
import { GalleryExternalHtml } from './GalleryExternalHtml';

// Reads back the HTML GalleryExternalHtml writes.
const parseGalleryElement = (element: HTMLElement) => {
  const images: GalleryImage[] = [];

  element.querySelectorAll('figure, img').forEach((el) => {
    if (el.tagName === 'FIGURE') {
      const img = el.querySelector('img');

      if (img?.src) {
        images.push({
          url: img.src,
          caption: el.querySelector('figcaption')?.textContent ?? undefined,
        });
      }
    } else if (el instanceof HTMLImageElement && !el.closest('figure') && el.src) {
      images.push({ url: el.src });
    }
  });

  return { images: JSON.stringify(images), columns: element.getAttribute('data-columns') ?? '3' };
};

export const galleryBlock = createReactBlockSpec(galleryBlockConfig, {
  render: GalleryBlockContent,
  toExternalHTML: GalleryExternalHtml,
  parse: (element) =>
    element.tagName === 'DIV' && element.classList.contains('erxes-editor-gallery')
      ? parseGalleryElement(element)
      : undefined,
});
