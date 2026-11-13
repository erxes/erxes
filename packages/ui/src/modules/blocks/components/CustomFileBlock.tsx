import { createFileBlockConfig } from '@blocknote/core';
import type { ReactCustomBlockRenderProps } from '@blocknote/react';
import { FileBlockWrapper, createReactBlockSpec, useUploadLoading } from '@blocknote/react';
import { IconFile } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui/components/spinner';
import type { FC } from 'react';
import { readImage } from 'erxes-ui/utils/core';

type FileRenderProps = ReactCustomBlockRenderProps<typeof createFileBlockConfig>;

const CustomFilePreview: FC<Pick<FileRenderProps, 'block'>> = ({ block }) => {
  const url = readImage(block.props.url);

  return (
    <div className="bn-file-name-with-icon" contentEditable={false} draggable={false}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bn-file-icon">
          <IconFile size={24} />
        </div>
        <p className="bn-file-name">{block.props.name || block.props.url}</p>
      </a>
    </div>
  );
};

const CustomFileBlockContent: FC<FileRenderProps> = (props) => {
  const loading = useUploadLoading(props.block.id);

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
    <FileBlockWrapper {...props} buttonIcon={<IconFile size={24} />}>
      <CustomFilePreview block={props.block} />
    </FileBlockWrapper>
  );
};

export const customFileBlock = createReactBlockSpec(createFileBlockConfig, {
  meta: { fileBlockAccept: ['*/*'] },
  render: CustomFileBlockContent,
});
