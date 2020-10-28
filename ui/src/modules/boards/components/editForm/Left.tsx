import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IItem, IItemParams, IOptions } from 'modules/boards/types';
import Checklists from 'modules/checklists/containers/Checklists';
import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import {
  EditorActions,
  EditorWrapper
} from 'modules/internalNotes/components/Form';
import React, { useEffect, useState } from 'react';
import xss from 'xss';
import {
  Content,
  ContentWrapper,
  LeftContainer,
  TitleRow
} from '../../styles/item';
import Labels from '../label/Labels';
import Actions from './Actions';

type DescProps = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  contentType: string;
};

const Description = (props: DescProps) => {
  const { item, saveItem, contentType } = props;
  const [edit, setEdit] = useState(false);
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setDescription(item.description);
  }, [item.description]);

  const onSend = () => {
    saveItem({ description });
    setEdit(false);
  };

  const toggleEdit = () => setEdit(currentValue => !currentValue);

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
          uppercase={false}
          onClick={toggleEdit}
        >
          Cancel
        </Button>
        {item.description !== description && (
          <Button
            onClick={onSend}
            btnStyle="success"
            size="small"
            uppercase={false}
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
              __html: description
                ? xss(description)
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
    onChangeStage
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
