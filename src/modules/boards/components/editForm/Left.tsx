import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import React from 'react';

import { IItem } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { LeftContainer, TitleRow } from '../../styles/item';

type Props = {
  item: IItem;
  onChangeField: (name: 'description', value: any) => void;
  type: string;
  description: string;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  attachments: IAttachment[];
};

class Left extends React.Component<Props> {
  render() {
    const {
      item,
      onChangeField,
      attachments,
      onChangeAttachment,
      description,
      type
    } = this.props;

    const descriptionOnChange = e =>
      onChangeField('description', (e.target as HTMLInputElement).value);

    return (
      <LeftContainer>
        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="attach" />
              Attachments
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
              Description
            </ControlLabel>
          </TitleRow>

          <FormControl
            componentClass="textarea"
            defaultValue={description}
            onChange={descriptionOnChange}
          />
        </FormGroup>

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
