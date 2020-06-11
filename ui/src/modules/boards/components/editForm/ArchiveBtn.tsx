import { ColorButton } from 'modules/boards/styles/common';
import { IItem } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import React from 'react';

interface IProps {
  removeItem: (itemId: string) => void;
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
}

export const ArchiveBtn = (props: IProps) => {
  const { removeItem, item, saveItem, sendToBoard, onChangeStage } = props;

  if (item.status === 'archived') {
    const onRemove = () => removeItem(item._id);

    const onSendToBoard = () => {
      if (sendToBoard) {
        sendToBoard(item);
      } else {
        saveItem({ status: 'active' });
      }
    };

    return (
      <>
        <ColorButton color={colors.colorCoreRed} onClick={onRemove}>
          <Icon icon="times-circle" />
          {__('Delete')}
        </ColorButton>
        <ColorButton onClick={onSendToBoard}>
          <Icon icon="redo" />
          {__('Send to board')}
        </ColorButton>
      </>
    );
  }

  const onArchive = () => {
    saveItem({ status: 'archived' });
    if (onChangeStage) {
      onChangeStage(item.stageId);
    }
  };

  return (
    <ColorButton onClick={onArchive}>
      <Icon icon="archive-alt" />
      {__('Archive')}
    </ColorButton>
  );
};
