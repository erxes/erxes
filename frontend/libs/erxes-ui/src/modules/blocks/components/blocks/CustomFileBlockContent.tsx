import { FileBlockWrapper, useUploadLoading } from '@blocknote/react';
import { IconFile } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui/components';
import type { FC } from 'react';
import type {
  FileRenderProps,
  FileWrapperRenderProps,
} from '../../types/blocks/CustomFileBlock';
import { CustomFilePreview } from './CustomFilePreview';

export const CustomFileBlockContent: FC<FileRenderProps> = (props) => {
  const loading = useUploadLoading(props.block.id);
  // BlockNote's wrapper uses a generic file schema rather than this concrete schema.
  const wrapperProps: FileWrapperRenderProps = {
    ...props,
    editor: props.editor as unknown as FileWrapperRenderProps['editor'],
  };

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
    <FileBlockWrapper
      {...wrapperProps}
      buttonText={props.editor.dictionary.file_blocks.file.add_button_text}
      buttonIcon={<IconFile size={24} />}
    >
      <CustomFilePreview block={props.block} />
    </FileBlockWrapper>
  );
};
