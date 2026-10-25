import {
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconFileZip,
  IconMovie,
  IconMusic,
  IconPhoto,
} from '@tabler/icons-react';

const pickIcon = (mimeType: string) => {
  if (mimeType === 'application/pdf') return IconFileTypePdf;
  if (mimeType.startsWith('image/')) return IconPhoto;
  if (mimeType.startsWith('video/')) return IconMovie;
  if (mimeType.startsWith('audio/')) return IconMusic;
  if (mimeType.includes('spreadsheet') || mimeType === 'text/csv')
    return IconFileSpreadsheet;
  if (mimeType.includes('wordprocessing') || mimeType.startsWith('text/'))
    return IconFileText;
  if (mimeType === 'application/zip') return IconFileZip;

  return IconFile;
};

export const FileTypeIcon = ({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) => {
  const Icon = pickIcon(mimeType);

  return <Icon className={className} />;
};
