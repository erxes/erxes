import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import React from 'react';

import { IItem, IOptions } from 'modules/boards/types';
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
};

class Left extends React.Component<Props> {
  render() {
    const {
      item,
      saveItem,
      options,
      copyItem,
      removeItem,
      onUpdate
    } = this.props;

    const descriptionOnBlur = e => {
      const description = e.target.value;

      if (item.description !== description) {
        saveItem({ description: e.target.value });
      }
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

          <Uploader
            defaultFileList={attachments}
            onChange={onChangeAttachment}
          />
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
            defaultValue={item.description}
            onBlur={descriptionOnBlur}
            autoFocus={true}
          />
        </FormGroup>

        <Checklists contentType={options.type} contentTypeId={item._id} />

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
  }
}

export default Left;
