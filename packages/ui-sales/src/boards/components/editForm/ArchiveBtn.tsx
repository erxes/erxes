import { IUser } from '@erxes/ui/src/auth/types';
import { ColorButton } from '../../styles/common';
import { IItem } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import colors from '@erxes/ui/src/styles/colors';
import { __, can } from '@erxes/ui/src/utils';
import React from 'react';

interface IProps {
  removeItem: (itemId: string) => void;
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  currentUser: IUser
}

export const ArchiveBtn = (props: IProps) => {
  const { removeItem, item, saveItem, sendToBoard, onChangeStage, currentUser } = props;

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
        {can('dealsRemove', currentUser) && (
          <ColorButton color={colors.colorCoreRed} onClick={onRemove}>
            <Icon icon="times-circle" />
            {__('Delete')}
          </ColorButton>
        )}

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

  if (!can('dealsArchive', currentUser))
    return <></>;

  return (
    <ColorButton onClick={onArchive}>
      <Icon icon="archive-alt" />
      {__('Archive')}
    </ColorButton>
  );
};
