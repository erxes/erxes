import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import React from 'react';

import { IItem } from 'modules/boards/types';
import Checklists from 'modules/checklists/containers/Checklists';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import { LeftContainer, TitleRow } from '../../styles/item';
import Labels from '..//label/Labels';

type Props = {
  item: IItem;
  onChangeField: (name: 'description', value: any) => void;
  type: string;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
};

class Left extends React.Component<Props> {
  render() {
    const { item, onChangeField, onChangeAttachment, type } = this.props;

    const descriptionOnChange = e =>
      onChangeField('description', (e.target as HTMLInputElement).value);

    const descriptionOnBlur = e =>
      this.props.onBlurFields('description', e.target.value);

    const attachments =
      (item.attachments && extractAttachment(item.attachments)) || [];

    return (
      <LeftContainer>
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
            onChange={descriptionOnChange}
            onBlur={descriptionOnBlur}
            autoFocus={true}
          />
        </FormGroup>

        <Checklists contentType={type} contentTypeId={item._id} />

        <ActivityInputs
          contentTypeId={item._id}
          contentType={type}
          showEmail={false}
        />

        <ActivityLogs
          target={item.name}
          contentId={item._id}
          contentType={type}
          extraTabs={[]}
        />
      </LeftContainer>
    );
  }
}

export default Left;
