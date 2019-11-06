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
import { __ } from 'modules/common/utils';
import { LeftContainer, TitleRow } from '../../styles/item';
import { IPipelineLabel } from '../../types';
import Labels from '..//label/Labels';

type Props = {
  item: IItem;
  labels: IPipelineLabel[];
  onChangeField: (name: 'description', value: any) => void;
  type: string;
  description: string;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  attachments: IAttachment[];
  onBlurFields: (name: 'description' | 'name', value: string) => void;
};

class Left extends React.Component<Props> {
  render() {
    const {
      item,
      onChangeField,
      attachments,
      onChangeAttachment,
      description,
      type,
      labels
    } = this.props;

    const descriptionOnChange = e =>
      onChangeField('description', (e.target as HTMLInputElement).value);

    const descriptionOnBlur = e =>
      this.props.onBlurFields('description', e.target.value);

    return (
      <LeftContainer>
        {labels.length > 0 && (
          <FormGroup>
            <TitleRow>
              <ControlLabel>
                <Icon icon="tag-alt" />
                {__('Labels')}
              </ControlLabel>
            </TitleRow>

            <Labels labels={labels} />
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
            defaultValue={description}
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
