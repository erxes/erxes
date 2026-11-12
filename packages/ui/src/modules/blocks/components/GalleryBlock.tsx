import { createReactBlockSpec } from '@blocknote/react';
import type { CSSProperties } from 'react';
import { readImage } from 'erxes-ui/utils/core';
import type { GalleryRenderProps } from 'erxes-ui/modules/blocks/constant/galleryBlockConfig';
import { galleryBlockConfig } from 'erxes-ui/modules/blocks/constant/galleryBlockConfig';
import type { GalleryImage } from 'erxes-ui/modules/blocks/utils/galleryImages';
import {
  keyGalleryImages,
  parseGalleryColumns,
  parseGalleryImages,
} from 'erxes-ui/modules/blocks/utils/galleryImages';
import { GalleryBlockContent } from './GalleryBlockContent';

const EXTERNAL_IMAGE_STYLE: CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  display: 'block',
};

const GalleryExternalHTML = ({ block }: GalleryRenderProps) => {
  const keyedImages = keyGalleryImages(parseGalleryImages(block.props.images));
  const columns = parseGalleryColumns(block.props.columns);

  return (
    <div
      className="erxes-editor-gallery"
      data-columns={String(columns)}
      style={
        keyedImages.length > 0
          ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '8px' }
          : { display: 'none' }
      }
    >
      {keyedImages.map(({ image, key }) =>
        image.caption ? (
          <figure key={key} style={{ margin: 0 }}>
            <img src={readImage(image.url)} alt={image.caption} style={EXTERNAL_IMAGE_STYLE} />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ) : (
          <img key={key} src={readImage(image.url)} alt="" style={EXTERNAL_IMAGE_STYLE} />
        ),
      )}
    </div>
  );
};

// Reads back the HTML GalleryExternalHTML writes.
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
  toExternalHTML: GalleryExternalHTML,
  parse: (element) =>
    element.tagName === 'DIV' && element.classList.contains('erxes-editor-gallery')
      ? parseGalleryElement(element)
      : undefined,
});
