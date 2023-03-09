import Icon from '@erxes/ui/src/components/Icon';
import { IconWrapper } from './styles';
import React from 'react';
import { colors } from '@erxes/ui/src/styles';

export const renderFileIcon = (url: string) => {
  const fileExtension = url && url.split('.').pop();

  let filePreview;
  let color;

  switch (fileExtension) {
    case 'docx':
      filePreview = 'doc';
      color = colors.colorCoreBlue;
      break;
    case 'pptx':
      filePreview = 'ppt';
      color = colors.colorCoreRed;
      break;
    case 'xlsx':
      filePreview = 'xls';
      color = colors.colorCoreGreen;
      break;
    case 'mp4':
      filePreview = 'mp4';
      color = colors.colorCoreDarkBlue;
      break;
    case 'jpeg':
    case 'jpg':
      filePreview = 'jpg';
      color = colors.colorCoreGray;
      break;
    case 'gif':
      filePreview = 'gif-black';
      color = colors.colorCoreSunYellow;
      break;
    case 'png':
      filePreview = 'png';
      break;
    case 'zip':
    case 'csv':
    case 'doc':
    case 'ppt':
    case 'psd':
    case 'avi':
    case 'txt':
    case 'rar':
    case 'mp3':
    case 'pdf':
    case 'xls':
      filePreview = fileExtension;
      color = colors.colorCoreOrange;
      break;
    default:
      filePreview = 'file-alt';
  }

  return (
    <IconWrapper color={color}>
      <Icon icon={filePreview} size={22} />
    </IconWrapper>
  );
};
