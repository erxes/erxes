import { IconFile } from '@tabler/icons-react';
import type { FC } from 'react';
import { readImage } from '../../../../utils/core';
import type { FileRenderProps } from '../../types/blocks/CustomFileBlock';

export const CustomFilePreview: FC<Pick<FileRenderProps, 'block'>> = ({
  block,
}) => {
  const url = readImage(block.props.url, undefined, true);

  return (
    <div
      className="bn-file-name-with-icon"
      contentEditable={false}
      draggable={false}
    >
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
