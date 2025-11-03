import {
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconVideo,
} from '@tabler/icons-react';

export const getFileIcon = (file: {
  file: File | { type: string; name: string };
}) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (
    fileType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    fileType.includes('word') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <IconFileText className="size-4 opacity-60" />;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('archive') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar')
  ) {
    return <IconFileZip className="size-4 opacity-60" />;
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return <IconFileSpreadsheet className="size-4 opacity-60" />;
  } else if (fileType.includes('video/')) {
    return <IconVideo className="size-4 opacity-60" />;
  } else if (fileType.includes('audio/')) {
    return <IconHeadphones className="size-4 opacity-60" />;
  } else if (fileType.startsWith('image/')) {
    return <IconPhoto className="size-4 opacity-60" />;
  }
  return <IconFile className="size-4 opacity-60" />;
};
