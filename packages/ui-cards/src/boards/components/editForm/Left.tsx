import {
  Content,
  ContentWrapper,
  LeftContainer,
  TitleRow
} from '../../styles/item';
import {
  EditorActions,
  EditorWrapper
} from '@erxes/ui-internalnotes/src/components/Form';
import { IItem, IItemParams, IOptions } from '../../types';
import React, { useEffect, useState } from 'react';
import { __, extractAttachment } from '@erxes/ui/src/utils';

import Actions from './Actions';
import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import Button from '@erxes/ui/src/components/Button';
import Checklists from '../../../checklists/containers/Checklists';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IAttachment } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import Labels from '../label/Labels';
import Uploader from '@erxes/ui/src/components/Uploader';
import { isEnabled } from '@erxes/ui/src/utils/core';
import xss from 'xss';

type DescProps = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  contentType: string;
};

const Description = (props: DescProps) => {
  const { item, saveItem, contentType } = props;
  const [edit, setEdit] = useState(false);
  const [isSubmitted, setSubmit] = useState(false);
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setDescription(item.description);
  }, [item.description]);

  useEffect(() => {
    if (isSubmitted) {
      setEdit(false);
    }
  }, [isSubmitted]);

  const onSend = () => {
    saveItem({ description });
    setSubmit(true);
  };

  const toggleEdit = () => {
    setEdit(currentValue => !currentValue);
    setSubmit(false);
  };

  const onChangeDescription = e => {
    setDescription(e.editor.getData());
  };

  const renderFooter = () => {
    return (
      <EditorActions>
        <Button
          icon="times-circle"
          btnStyle="simple"
          size="small"
          onClick={toggleEdit}
        >
          Cancel
        </Button>
        {item.description !== description && (
          <Button
            onClick={onSend}
            btnStyle="success"
            size="small"
            icon="check-circle"
          >
            Save
          </Button>
        )}
      </EditorActions>
    );
  };

  return (
    <FormGroup>
      <ContentWrapper isEditing={edit}>
        <TitleRow>
          <ControlLabel>
            <Icon icon="align-left-justify" />
            {__('Description')}
          </ControlLabel>
        </TitleRow>

        {!edit ? (
          <Content
            onClick={toggleEdit}
            dangerouslySetInnerHTML={{
              __html: item.description
                ? xss(item.description)
                : `${__('Add a more detailed description')}...`
            }}
          />
        ) : (
          <EditorWrapper>
            <EditorCK
              onCtrlEnter={onSend}
              content={description}
              onChange={onChangeDescription}
              height={120}
              isSubmitted={isSubmitted}
              autoFocus={true}
              name={`${contentType}_description_${item._id}`}
              toolbar={[
                {
                  name: 'basicstyles',
                  items: [
                    'Bold',
                    'Italic',
                    'NumberedList',
                    'BulletedList',
                    'Link',
                    'Unlink',
                    '-',
                    'Image',
                    'EmojiPanel'
                  ]
                }
              ]}
            />

            {renderFooter()}
          </EditorWrapper>
        )}
      </ContentWrapper>
    </FormGroup>
  );
};

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  addItem: (doc: IItemParams, callback: () => void) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
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
    sendToBoard,
    onChangeStage,
    onChangeRefresh
  } = props;

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
        onChangeStage={onChangeStage}
        onChangeRefresh={onChangeRefresh}
      />

      {item.labels.length > 0 && (
        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="label-alt" />
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

      <Description item={item} saveItem={saveItem} contentType={options.type} />

      <Checklists
        contentType={options.type}
        contentTypeId={item._id}
        stageId={item.stageId}
        addItem={addItem}
      />

      <ActivityInputs
        contentTypeId={item._id}
        contentType={`cards:${options.type}`}
        showEmail={false}
      />

      {isEnabled('logs') && (
        <ActivityLogs
          target={item.name}
          contentId={item._id}
          contentType={`cards:${options.type}`}
          extraTabs={
            options.type === 'cards:task'
              ? []
              : [{ name: 'cards:task', label: 'Task' }]
          }
        />
      )}
    </LeftContainer>
  );
};

export default Left;
