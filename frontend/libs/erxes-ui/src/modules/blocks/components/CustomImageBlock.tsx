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

type ImageRenderProps = ReactCustomBlockRenderProps<
  typeof imageBlockConfig,
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

  return (
    <div className="bn-visual-media-wrapper">
      {(!imgLoaded || isResolving) && (
        <div className="flex items-center justify-center min-h-24 w-full">
          <Spinner size="sm" />
        </div>
      )}
      {!isResolving && src && (
        <img
          className="bn-visual-media"
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
  if (!url) return <p>Add image</p>;
  const img = (
    <img
      src={url}
      alt={caption || name || ''}
      {...(previewWidth ? { width: previewWidth } : {})}
    />
  );
  if (caption) {
    return (
      <figure>
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

export const customImageBlock = createReactBlockSpec(imageBlockConfig, {
  render: CustomImageBlockContent,
  toExternalHTML: ExternalImageHtml,
  parse: (element) => {
    if (element.tagName === 'IMG') {
      if (element.closest('figure')) return undefined;
      const img = element as HTMLImageElement;
      return {
        url: img.src || undefined,
        previewWidth: img.width || undefined,
      };
    }
    if (element.tagName === 'FIGURE') {
      const img = element.querySelector('img');
      if (!img) return undefined;
      const caption =
        element.querySelector('figcaption')?.textContent || undefined;
      return {
        url: img.src || undefined,
        caption,
        previewWidth: img.width || undefined,
      };
    }
    return undefined;
  },
});
