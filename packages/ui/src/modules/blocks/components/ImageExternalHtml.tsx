import type { CSSProperties } from 'react';
import {
  getImageStyle,
  IMAGE_STYLE_PRESETS,
  type ImageRenderProps,
  type ImageStyle,
} from 'erxes-ui/modules/blocks/constant/imageBlockConfig';

// Exported HTML is read without erxes-ui's stylesheet, so it carries its layout inline.
const getFloatContainerStyle = (imageStyle: ImageStyle, maxWidth: number): CSSProperties => {
  const base: CSSProperties = {
    width: '100%',
    maxWidth: `${maxWidth}px`,
  };

  if (imageStyle === 'float-left') {
    return {
      ...base,
      float: 'left',
      marginRight: '1.25em',
      marginBottom: '0.5em',
    };
  }

  if (imageStyle === 'float-right') {
    return {
      ...base,
      float: 'right',
      marginLeft: '1.25em',
      marginBottom: '0.5em',
    };
  }

  return { ...base, margin: '0 auto' };
};

export const ImageExternalHtml = ({ block }: ImageRenderProps) => {
  const { url, caption, name, previewWidth } = block.props;
  const imageStyle = getImageStyle(block.props.imageStyle);

  if (!url) return <p>Add image</p>;

  const maxWidth = previewWidth || IMAGE_STYLE_PRESETS[imageStyle].maxWidth;
  const containerStyle = getFloatContainerStyle(imageStyle, maxWidth);

  const img = (
    <img
      src={url}
      alt={caption || name || ''}
      className={`erxes-editor-image erxes-editor-image--${imageStyle}`}
      data-image-style={imageStyle}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      {...(previewWidth ? { width: previewWidth } : {})}
    />
  );

  return (
    <figure
      className={`erxes-editor-image erxes-editor-image--${imageStyle}`}
      data-image-style={imageStyle}
      style={containerStyle}
    >
      {img}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};
