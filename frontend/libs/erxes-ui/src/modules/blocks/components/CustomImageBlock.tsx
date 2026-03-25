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
import { FC } from 'react';
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

  if (loadingState === 'loading') {
    return (
      <div className="bn-visual-media-wrapper flex items-center justify-center min-h-24">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div className="bn-visual-media-wrapper">
      <img
        className="bn-visual-media"
        src={downloadUrl ?? block.props.url}
        alt={block.props.caption || block.props.name || ''}
        contentEditable={false}
        draggable={false}
      />
    </div>
  );
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
