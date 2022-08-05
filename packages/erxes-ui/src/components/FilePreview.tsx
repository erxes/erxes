import Icon from './Icon';
import ImageWithPreview from './ImageWithPreview';
import React from 'react';
import colors from '../styles/colors';
import { rgba } from '../styles/ecolor';
import styled from 'styled-components';

const Wrapper = styled.a`
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  color: ${colors.textPrimary};
  position: relative;
  background: ${rgba(colors.colorCoreDarkBlue, 0.04)};

  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  }

  img,
  video {
    max-width: 100%;
    max-height: 320px;
  }
`;

const SelectOption = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Content = styled.div`
  flex: 1;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  font-weight: 500;
  max-width: 320px;
  justify-content: space-between;

  i {
    color: ${colors.colorCoreGray};
    margin-left: 10px;
    font-size: 14px;

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }
`;

const IconWrapper = styled.div`
  height: 40px;
  width: 50px;
  background: ${rgba(colors.colorCoreDarkBlue, 0.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;

  i {
    font-size: 26px;
    color: ${colors.colorSecondary};
  }
`;

type Props = {
  fileUrl: string;
  fileName?: string;
};

export default function FilePreview({ fileUrl, fileName }: Props) {
  if (!fileUrl || !fileUrl.split) {
    return null;
  }

  const renderFile = (icon: string) => {
    const attr = {
      rel: 'noopener noreferrer',
      href: fileUrl,
      target: '_blank'
    };

    return (
      <Wrapper {...attr}>
        <IconWrapper>
          <Icon icon={icon} />
        </IconWrapper>
        <Content>
          <SelectOption>{fileName || fileUrl}</SelectOption>
          <Icon icon="down-arrow" />
        </Content>
      </Wrapper>
    );
  };

  const renderVideo = () => {
    return (
      <Wrapper>
        <Content>
          <video controls={true} loop={true}>
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Content>
      </Wrapper>
    );
  };

  const renderImagePreview = () => {
    return (
      <Wrapper>
        <ImageWithPreview alt={fileName || fileUrl} src={fileUrl} />
      </Wrapper>
    );
  };

  const fileExtension = fileUrl.split('.').pop();

  let filePreview;

  switch (fileExtension) {
    case 'docx':
      filePreview = renderFile('doc');
      break;
    case 'pptx':
      filePreview = renderFile('ppt');
      break;
    case 'xlsx':
      filePreview = renderFile('xls');
      break;
    case 'mp4':
      filePreview = renderVideo();
      break;
    case 'jpeg':
    case 'jpg':
    case 'gif':
    case 'png':
      filePreview = renderImagePreview();
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
      filePreview = renderFile(fileExtension);
      break;
    default:
      filePreview = renderFile('file-2');
  }

  return filePreview;
}
