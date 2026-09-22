import React from 'react';
import {
  IconPhoto,
  IconVideo,
  IconVolume,
  IconFileText,
  IconFileTypePdf,
  IconTable,
  IconFileZip,
  IconCode,
  IconFile,
  type IconProps,
} from '@tabler/icons-react';
import { AttachmentType } from '@libs/format-file';

/**
 * Returns the corresponding Tabler Icon component based on the attachment type.
 * @param type - The AttachmentType category
 * @returns A Tabler Icon React component
 */
export function getAttachmentIcon(type: AttachmentType): React.FC<IconProps> {
  switch (type) {
    case 'image':
      return IconPhoto;
    case 'video':
      return IconVideo;
    case 'audio':
      return IconVolume;
    case 'pdf':
      return IconFileTypePdf;
    case 'document':
      return IconFileText;
    case 'spreadsheet':
      return IconTable;
    case 'archive':
      return IconFileZip;
    case 'code':
      return IconCode;
    case 'file':
    default:
      return IconFile;
  }
}
