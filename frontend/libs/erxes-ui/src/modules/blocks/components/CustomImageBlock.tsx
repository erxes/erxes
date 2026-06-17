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
import { CSSProperties, FC, useEffect, useState } from 'react';
import { Dialog, Spinner } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';

const IMAGE_STYLES = ['normal', 'wide', 'float-left', 'float-right'] as const;

export type ImageStyle = (typeof IMAGE_STYLES)[number];

export const IMAGE_STYLE_PRESETS: Record<
  ImageStyle,
  {
    previewWidth: number;
    maxWidth: number;
  }
> = {
  normal: { previewWidth: 720, maxWidth: 720 },
  wide: { previewWidth: 1080, maxWidth: 1080 },
  'float-left': { previewWidth: 300, maxWidth: 400 },
  'float-right': { previewWidth: 300, maxWidth: 400 },
};

const getImageStyle = (value?: string): ImageStyle =>
  (IMAGE_STYLES as readonly string[]).includes(value ?? '')
    ? (value as ImageStyle)
    : 'normal';

const getImageStyleClasses = (imageStyle: ImageStyle) => {
  switch (imageStyle) {
    case 'wide':
      return 'w-full max-w-[1080px]';
    case 'float-left':
      return 'max-w-[400px] w-full';
    case 'float-right':
      return 'max-w-[400px] w-full';
    default:
      return 'w-full max-w-[720px]';
  }
};

/** Reads the image style from a DOM element's data attribute or class name. */
const getImageStyleFromElement = (element: HTMLElement): ImageStyle => {
  const explicitStyle =
    element.getAttribute('data-image-style') ||
    element
      .getAttribute('class')
      ?.match(/erxes-editor-image--(normal|wide|float-left|float-right)/)?.[1];

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

/** Casts image render props to file block wrapper props. */
const toFileBlockProps = (props: ImageRenderProps): FileBlockRenderProps =>
  props as unknown as FileBlockRenderProps;

/** Renders the image preview with a double-click to open full-size dialog. */
const CustomImagePreview: FC<FileBlockRenderProps> = ({ block }) => {
  const { loadingState, downloadUrl } = useResolveUrl(block.props.url ?? '');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
        <>
          <div
            className={cn(
              'bn-visual-media mx-auto cursor-pointer p-0 border-0 bg-transparent',
              getImageStyleClasses(imageStyle),
            )}
            style={imgLoaded ? undefined : { display: 'none' }}
            contentEditable={false}
            tabIndex={0}
            onDoubleClick={() => setPreviewOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPreviewOpen(true);
              }
            }}
          >
            <img
              className="w-full h-auto block"
              src={src}
              alt={block.props.caption || block.props.name || ''}
              draggable={false}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <Dialog.Content className="bg-transparent shadow-none p-0 border-0 max-w-fit">
              <Dialog.Title className="sr-only">
                {block.props.caption || block.props.name || 'Image preview'}
              </Dialog.Title>
              <img
                src={src}
                alt={block.props.caption || block.props.name || ''}
                className="shadow-2xl rounded max-w-[90vw] max-h-[85vh] object-contain"
              />
            </Dialog.Content>
          </Dialog>
        </>
      )}
    </div>
  );
};

/** Returns inline styles for float-left/right image container positioning. */
const getFloatContainerStyle = (
  imageStyle: ImageStyle,
  maxWidth: number,
): CSSProperties => {
  const base: CSSProperties = {
    width: '100%',
    maxWidth: `${maxWidth}px`,
  };
  if (imageStyle === 'float-left')
    return {
      ...base,
      float: 'left',
      marginRight: '1.25em',
      marginBottom: '0.5em',
    };
  if (imageStyle === 'float-right')
    return {
      ...base,
      float: 'right',
      marginLeft: '1.25em',
      marginBottom: '0.5em',
    };
  return { ...base, margin: '0 auto' };
};

/** Renders the image block as external HTML for export. */
const ExternalImageHtml: FC<ImageRenderProps> = ({ block }) => {
  const { url, caption, name, previewWidth } = block.props;
  const imageStyle = getImageStyle(
    (block.props as { imageStyle?: string }).imageStyle,
  );

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

/** Renders the image block content with upload loading state and float style injection. */
const CustomImageBlockContent: FC<ImageRenderProps> = (props) => {
  const loading = useUploadLoading(props.block.id);
  const fileProps = toFileBlockProps(props);
  const imageStyle = getImageStyle(
    (props.block.props as { imageStyle?: string }).imageStyle,
  );

  useEffect(() => {
    const blockId = props.block.id;
    const styleId = `erxes-img-float-${blockId}`;

    document.getElementById(styleId)?.remove();

    if (imageStyle !== 'float-left' && imageStyle !== 'float-right') return;

    const maxWidth =
      (props.block.props as { previewWidth?: number }).previewWidth ||
      IMAGE_STYLE_PRESETS[imageStyle].maxWidth;
    const dir = imageStyle === 'float-left' ? 'left' : 'right';
    const margin =
      imageStyle === 'float-left'
        ? 'margin-right:1.25em'
        : 'margin-left:1.25em';

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `[data-id="${blockId}"]{float:${dir};max-width:${maxWidth}px;width:100%;${margin};margin-bottom:.75em}`;
    document.head.appendChild(styleEl);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [
    props.block.id,
    imageStyle,
    (props.block.props as { previewWidth?: number }).previewWidth,
  ]);

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
