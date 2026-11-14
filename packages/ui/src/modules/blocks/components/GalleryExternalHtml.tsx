import type { CSSProperties } from 'react';
import { readImage } from 'erxes-ui/utils/core';
import type { GalleryRenderProps } from 'erxes-ui/modules/blocks/constant/galleryBlockConfig';
import {
  keyGalleryImages,
  parseGalleryColumns,
  parseGalleryImages,
} from 'erxes-ui/modules/blocks/utils/galleryImages';

// Exported HTML is read without erxes-ui's stylesheet, so it carries its layout inline.
const EXTERNAL_IMAGE_STYLE: CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  display: 'block',
};

export const GalleryExternalHtml = ({ block }: GalleryRenderProps) => {
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
