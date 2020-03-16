import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import React, { useEffect, useState } from 'react';

import { IItem, IItemParams, IOptions } from 'modules/boards/types';
import Checklists from 'modules/checklists/containers/Checklists';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import { LeftContainer, TitleRow } from '../../styles/item';
import Labels from '../label/Labels';
import Actions from './Actions';

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  addItem: (doc: IItemParams, callback: () => void) => void;
  sendToBoard?: (item: any) => void;
};

const Left = (props: Props) => {
  const {
    item,
    saveItem,
    options,
    copyItem,
    removeItem,
    onUpdate,
    addItem,
    sendToBoard
  } = props;

  const [description, setDescription] = useState(item.description);

  useEffect(
    () => {
      setDescription(item.description);
    },
    [item.description]
  );

  const onBlurDescription = () => {
    if (description !== item.description) {
      saveItem({ description });
    }
  };

  const onChangeDescription = e => {
    setDescription(e.target.value);
  };

  const onChangeAttachment = (files: IAttachment[]) =>
    saveItem({ attachments: files });

  const attachments =
    (item.attachments && extractAttachment(item.attachments)) || [];

  return (
    <LeftContainer>
      <Actions
        item={item}
        options={options}
        copyItem={copyItem}
        removeItem={removeItem}
        saveItem={saveItem}
        onUpdate={onUpdate}
        sendToBoard={sendToBoard}
      />

      {item.labels.length > 0 && (
        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="tag-alt" />
              {__('Labels')}
            </ControlLabel>
          </TitleRow>

          <Labels labels={item.labels} />
        </FormGroup>
      )}

      <FormGroup>
        <TitleRow>
          <ControlLabel>
            <Icon icon="paperclip" />
            {__('Attachments')}
          </ControlLabel>
        </TitleRow>

        <Uploader defaultFileList={attachments} onChange={onChangeAttachment} />
      </FormGroup>

      <FormGroup>
        <TitleRow>
          <ControlLabel>
            <Icon icon="align-left-justify" />
            {__('Description')}
          </ControlLabel>
        </TitleRow>

        <FormControl
          componentClass="textarea"
          value={description || ''}
          onBlur={onBlurDescription}
          onChange={onChangeDescription}
        />
      </FormGroup>

      <Checklists
        contentType={options.type}
        contentTypeId={item._id}
        stageId={item.stageId}
        addItem={addItem}
      />

      <ActivityInputs
        contentTypeId={item._id}
        contentType={options.type}
        showEmail={false}
      />

      <ActivityLogs
        target={item.name}
        contentId={item._id}
        contentType={options.type}
        extraTabs={
          options.type === 'task' ? [] : [{ name: 'task', label: 'Task' }]
        }
      />
    </LeftContainer>
  );
};

export default Left;
