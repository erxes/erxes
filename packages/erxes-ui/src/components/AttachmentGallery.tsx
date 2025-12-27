import React, { useState } from 'react';
import { __, confirm } from '../utils';

import Attachment from './Attachment';
import { IAttachment } from '../types';
import colors from '../styles/colors';
import { rgba } from '../styles/ecolor';
import styled from 'styled-components';

const List = styled.div`
  margin: 10px 0;
`;

const Item = styled.div`
  margin-bottom: 10px;
`;

const Delete = styled.span`
  text-decoration: underline;
  transition: all 0.3s ease;
  color: ${colors.colorCoreGray};
  &:hover {
    color: ${colors.colorCoreBlack};
    cursor: pointer;
  }
`;

const ToggleButton = styled(styled.div(Delete as any))`
  padding: 7px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.07)};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 100px;
  height: 4px;
  border-radius: 4px;
  background: ${rgba(colors.colorCoreDarkBlue, 0.15)};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percent: number }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => Math.max(0, Math.min(100, props.percent))}%;
  background: ${colors.colorSecondary};
  transition: width 0.2s ease;
`;

type Props = {
  attachments: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  removeAttachment: (index: number) => void;
  limit?: number;
};

function AttachmentsGallery(props: Props) {
  const [hideOthers, toggleHide] = useState(true);

  const removeAttachment = (index: number) => {
    props.removeAttachment(index);
  };

  const toggleAttachments = () => {
    toggleHide(!hideOthers);
  };

  const renderItem = (item: IAttachment, index: number) => {
    if (!item) {
      return null;
    }

    const onRemove = () => {
      confirm().then(() => removeAttachment(index));
    };

    const uploading = (item as any).uploading;
    const progress = (item as any).progress || 0;

    const extra = (
      <>
        {uploading && (
          <ProgressContainer>
            <span>{__('Uploading')} {progress}%</span>
            <ProgressTrack>
              <ProgressFill percent={progress} />
            </ProgressTrack>
          </ProgressContainer>
        )}
        <Delete onClick={onRemove}>{__('Delete')}</Delete>
      </>
    );

    return (
      <Item key={item.url}>
        <Attachment
          attachment={item}
          attachments={props.attachments}
          index={index}
          additionalItem={extra}
        />
      </Item>
    );
  };

  const renderToggleButton = (hiddenCount: number) => {
    if (hiddenCount > 0) {
      const buttonText = hideOthers
        ? `${__('View all attachments')} (${hiddenCount} ${__('hidden')})`
        : `${__('Show fewer attachments')}`;

      return (
        <ToggleButton onClick={toggleAttachments}>{buttonText}</ToggleButton>
      );
    }

    return null;
  };

  const { limit = 4 } = props;
  const length = props.attachments.length;

  

  return (
    <>
      <List>
        {props.attachments
          .slice(0, limit && hideOthers ? limit : length)
          .map((item, index) => renderItem(item, index))}
      </List>
      {renderToggleButton(length - limit)}
    </>
  );
}

export default AttachmentsGallery;
