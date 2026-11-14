import { createReactBlockSpec, useResolveUrl, useUploadLoading } from '@blocknote/react';
import { IconPhoto } from '@tabler/icons-react';
import type { FC, SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { Dialog } from 'erxes-ui/components/dialog';
import { Spinner } from 'erxes-ui/components/spinner';
import {
  customImageBlockConfig,
  getImageStyle,
  IMAGE_STYLE_PRESETS,
  type ImageRenderProps,
  type ImageStyle,
} from 'erxes-ui/modules/blocks/constant/imageBlockConfig';
import { ImageExternalHtml } from './ImageExternalHtml';
import { MediaBlockWrapper } from './MediaBlockWrapper';

// The preview image is at most max-h-80 tall.
const MAX_IMAGE_HEIGHT = 320;

// A missing or zero size sets no limit.
const sizeLimit = (size: number | undefined) => (size !== undefined && size > 0 ? size : Infinity);

const getEditorMaxImageWidth = (
  editor: Pick<ImageRenderProps['editor'], 'domElement'>,
  imageStyle: ImageStyle,
  dimensions?: { width: number; height: number },
) =>
  Math.min(
    sizeLimit(editor.domElement?.firstElementChild?.clientWidth),
    IMAGE_STYLE_PRESETS[imageStyle].maxWidth,
    sizeLimit(dimensions?.width),
    dimensions?.height ? (dimensions.width / dimensions.height) * MAX_IMAGE_HEIGHT : Infinity,
  );

const getImageStyleFromElement = (element: HTMLElement): ImageStyle => {
  const explicitStyle =
    element.getAttribute('data-image-style') ||
    element
      .getAttribute('class')
      ?.match(/erxes-editor-image--(normal|wide|float-left|float-right)/)?.[1];

  return getImageStyle(explicitStyle);
};

const CustomImagePreview: FC<
  Pick<ImageRenderProps, 'block'> & {
    onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  }
> = ({ block, onImageLoad }) => {
  const { loadingState, downloadUrl } = useResolveUrl(block.props.url ?? '');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const src = downloadUrl ?? block.props.url;
  const isResolving = loadingState === 'loading';

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setImgLoaded(true);
    onImageLoad(event);
  };

  return (
    <div className="bn-visual-media-wrapper" contentEditable={false}>
      {(!imgLoaded || isResolving) && (
        <div className="flex min-h-24 w-full items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {!isResolving && src && (
        <>
          <Button
            variant="ghost"
            size="flush"
            aria-label="Preview image"
            className={cn('mx-auto w-full max-w-full', !imgLoaded && 'hidden')}
            contentEditable={false}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              setPreviewOpen(true);
            }}
          >
            <img
              className="bn-visual-media block h-auto max-h-80 w-full max-w-full object-contain"
              src={src}
              alt={block.props.caption || block.props.name || ''}
              draggable={false}
              onLoad={handleImageLoad}
              onError={() => setImgLoaded(true)}
            />
          </Button>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <Dialog.Content
              variant="bare"
              className="w-auto max-w-lightbox"
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">
                {block.props.caption || block.props.name || 'Image preview'}
              </Dialog.Title>
              <img
                src={src}
                alt={block.props.caption || block.props.name || ''}
                className="max-h-lightbox max-w-lightbox rounded object-contain shadow-2xl"
              />
            </Dialog.Content>
          </Dialog>
        </>
      )}
    </div>
  );
};

const CustomImageBlockContent: FC<ImageRenderProps> = (props) => {
  const loading = useUploadLoading(props.block.id);
  const imageStyle = getImageStyle(props.block.props.imageStyle);
  const previewWidth = props.block.props.previewWidth;

  const [imageDimensions, setImageDimensions] = useState<{
    url: string;
    width: number;
    height: number;
  }>();

  const maxWidth = getEditorMaxImageWidth(
    props.editor,
    imageStyle,
    imageDimensions?.url === props.block.props.url ? imageDimensions : undefined,
  );

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const dimensions = {
      url: props.block.props.url,
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    };

    setImageDimensions(dimensions);

    if (!previewWidth && props.editor.isEditable) {
      props.editor.updateBlock(props.block, {
        props: {
          previewWidth: getEditorMaxImageWidth(props.editor, imageStyle, dimensions),
        },
      });
    }
  };

  useEffect(() => {
    const blockId = props.block.id;
    const styleId = `erxes-img-float-${blockId}`;

    document.getElementById(styleId)?.remove();

    if (imageStyle !== 'float-left' && imageStyle !== 'float-right') return;

    const floatWidth = Math.min(previewWidth || maxWidth, maxWidth);
    const dir = imageStyle === 'float-left' ? 'left' : 'right';
    const margin = imageStyle === 'float-left' ? 'margin-right:1.25em' : 'margin-left:1.25em';

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `[data-id="${blockId}"]{float:${dir};max-width:${floatWidth}px;width:100%;${margin};margin-bottom:.75em}`;
    document.head.appendChild(styleEl);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [props.block.id, imageStyle, previewWidth, maxWidth]);

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
    <div
      className="max-w-(--image-max-width) [&>.bn-file-block-content-wrapper]:max-w-full"
      style={{ '--image-max-width': `min(100%, ${maxWidth}px)` }}
    >
      <MediaBlockWrapper
        block={props.block}
        buttonIcon={<IconPhoto size={24} />}
        onResize={(width) =>
          props.editor.updateBlock(props.block, { props: { previewWidth: width } })
        }
      >
        <CustomImagePreview block={props.block} onImageLoad={handleImageLoad} />
      </MediaBlockWrapper>
    </div>
  );
};

export const customImageBlock = createReactBlockSpec(customImageBlockConfig, {
  meta: { fileBlockAccept: ['image/*'] },
  runsBefore: ['file'],
  render: CustomImageBlockContent,
  toExternalHTML: ImageExternalHtml,
  parse: (element) => {
    if (element instanceof HTMLImageElement) {
      if (element.closest('figure')) return undefined;

      const imageStyle = getImageStyleFromElement(element);

      return {
        url: element.src || undefined,
        previewWidth: element.width || IMAGE_STYLE_PRESETS[imageStyle].previewWidth || undefined,
        imageStyle,
      };
    }

    if (element.tagName === 'FIGURE') {
      const img = element.querySelector('img');

      if (!img) return undefined;

      const caption = element.querySelector('figcaption')?.textContent || undefined;
      const imageStyle = getImageStyleFromElement(element);

      return {
        url: img.src || undefined,
        caption,
        previewWidth: img.width || IMAGE_STYLE_PRESETS[imageStyle].previewWidth || undefined,
        imageStyle,
      };
    }

    return undefined;
  },
});
