import {
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  imageBlockConfig,
} from '@blocknote/core';
import {
  createReactBlockSpec,
  ReactCustomBlockRenderProps,
  ResizableFileBlockWrapper,
  useResolveUrl,
  useUploadLoading,
} from '@blocknote/react';
import { IconPhoto } from '@tabler/icons-react';
import { FC, useState } from 'react';
import { Spinner } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';

const IMAGE_STYLES = ['normal', 'wide'] as const;

export type ImageStyle = (typeof IMAGE_STYLES)[number];

export const IMAGE_STYLE_PRESETS: Record<
  ImageStyle,
  {
    previewWidth: number;
    maxWidth: number;
  }
> = {
  normal: {
    previewWidth: 720,
    maxWidth: 720,
  },
  wide: {
    previewWidth: 1080,
    maxWidth: 1080,
  },
};

const getImageStyle = (value?: string): ImageStyle =>
  value === 'wide' ? 'wide' : 'normal';

const getImageStyleClasses = (imageStyle: ImageStyle) =>
  imageStyle === 'wide' ? 'w-full max-w-[1080px]' : 'w-full max-w-[720px]';

const getImageStyleFromElement = (element: HTMLElement): ImageStyle => {
  const explicitStyle =
    element.getAttribute('data-image-style') ||
    element
      .getAttribute('class')
      ?.match(/erxes-editor-image--(normal|wide)/)?.[1];

  return getImageStyle(explicitStyle);
};

const customImageBlockConfig = {
  ...imageBlockConfig,
  propSchema: {
    ...imageBlockConfig.propSchema,
    imageStyle: {
      default: 'normal' as const,
      values: IMAGE_STYLES,
    },
  },
};

type ImageRenderProps = ReactCustomBlockRenderProps<
  typeof customImageBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

type FileBlockWrapperProps = Parameters<typeof ResizableFileBlockWrapper>[0];
type FileBlockRenderProps = Omit<
  FileBlockWrapperProps,
  'buttonText' | 'buttonIcon' | 'children'
>;

const toFileBlockProps = (props: ImageRenderProps): FileBlockRenderProps =>
  props as unknown as FileBlockRenderProps;

const CustomImagePreview: FC<FileBlockRenderProps> = ({ block }) => {
  const { loadingState, downloadUrl } = useResolveUrl(block.props.url ?? '');
  const [imgLoaded, setImgLoaded] = useState(false);

  const src = downloadUrl ?? block.props.url;
  const isResolving = loadingState === 'loading';
  const imageStyle = getImageStyle(
    (block.props as { imageStyle?: string }).imageStyle,
  );

  return (
    <div className="bn-visual-media-wrapper">
      {(!imgLoaded || isResolving) && (
        <div className="flex items-center justify-center min-h-24 w-full">
          <Spinner size="sm" />
        </div>
      )}
      {!isResolving && src && (
        <img
          className={cn(
            'bn-visual-media mx-auto',
            getImageStyleClasses(imageStyle),
          )}
          src={src}
          alt={block.props.caption || block.props.name || ''}
          contentEditable={false}
          draggable={false}
          style={imgLoaded ? undefined : { display: 'none' }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      )}
    </div>
  );
};

const ExternalImageHtml: FC<ImageRenderProps> = ({ block }) => {
  const { url, caption, name, previewWidth } = block.props;
  const imageStyle = getImageStyle(
    (block.props as { imageStyle?: string }).imageStyle,
  );

  if (!url) return <p>Add image</p>;

  const img = (
    <img
      src={url}
      alt={caption || name || ''}
      className={`erxes-editor-image erxes-editor-image--${imageStyle}`}
      data-image-style={imageStyle}
      style={{
        width: '100%',
        maxWidth: `${
          previewWidth || IMAGE_STYLE_PRESETS[imageStyle].maxWidth
        }px`,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
      {...(previewWidth ? { width: previewWidth } : {})}
    />
  );

  if (caption) {
    return (
      <figure
        className={`erxes-editor-image erxes-editor-image--${imageStyle}`}
        data-image-style={imageStyle}
        style={{
          width: '100%',
          maxWidth: `${
            previewWidth || IMAGE_STYLE_PRESETS[imageStyle].maxWidth
          }px`,
          margin: '0 auto',
        }}
      >
        {img}
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
  return img;
};

const CustomImageBlockContent: FC<ImageRenderProps> = (props) => {
  const loading = useUploadLoading(props.block.id);
  const fileProps = toFileBlockProps(props);

  if (loading) {
    return (
      <div className="bn-file-block-content-wrapper">
        <div className="bn-file-loading-preview flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      </div>
    );
  }

  return (
    <ResizableFileBlockWrapper
      block={fileProps.block}
      editor={fileProps.editor}
      buttonText={props.editor.dictionary.file_blocks.image.add_button_text}
      buttonIcon={<IconPhoto size={24} />}
    >
      <CustomImagePreview block={fileProps.block} editor={fileProps.editor} />
    </ResizableFileBlockWrapper>
  );
};

export const customImageBlock = createReactBlockSpec(customImageBlockConfig, {
  render: CustomImageBlockContent,
  toExternalHTML: ExternalImageHtml,
  parse: (element) => {
    if (element.tagName === 'IMG') {
      if (element.closest('figure')) return undefined;
      const img = element as HTMLImageElement;
      const imageStyle = getImageStyleFromElement(img);
      return {
        url: img.src || undefined,
        previewWidth:
          img.width ||
          IMAGE_STYLE_PRESETS[imageStyle].previewWidth ||
          undefined,
        imageStyle,
      };
    }
    if (element.tagName === 'FIGURE') {
      const img = element.querySelector('img');
      if (!img) return undefined;
      const caption =
        element.querySelector('figcaption')?.textContent || undefined;
      const imageStyle = getImageStyleFromElement(element);
      return {
        url: img.src || undefined,
        caption,
        previewWidth:
          img.width ||
          IMAGE_STYLE_PRESETS[imageStyle].previewWidth ||
          undefined,
        imageStyle,
      };
    }
    return undefined;
  },
});
