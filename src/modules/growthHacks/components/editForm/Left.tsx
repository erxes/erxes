import Datetime from '@nateradebaugh/react-datetime';
import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import React from 'react';

import { LeftContainer, TitleRow } from 'modules/boards/styles/item';
import { IItem } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';

type Props = {
  item: IItem;
  onChangeField: (name: 'description' | 'closeDate', value: any) => void;
  onChangeExtraField: (name: 'hackDescription' | 'goal', value: any) => void;
  type: string;
  description: string;
  hackDescription: string;
  goal: string;
  closeDate: Date;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  attachments: IAttachment[];
};

class Left extends React.Component<Props> {
  renderInput = (props, openCalendar, closeCalendar) => {
    return (
      <div>
        <input {...props} />
        <button onClick={openCalendar}>open calendar</button>
        <button onClick={closeCalendar}>close calendar</button>
      </div>
    );
  };

  render() {
    const {
      item,
      onChangeField,
      onChangeExtraField,
      attachments,
      onChangeAttachment,
      description,
      hackDescription,
      goal,
      closeDate,
      type
    } = this.props;

    const descriptionOnChange = e =>
      onChangeField('description', (e.target as HTMLInputElement).value);

    const hackDescriptionOnChange = e =>
      onChangeExtraField(
        'hackDescription',
        (e.target as HTMLInputElement).value
      );

    const goalOnChange = e =>
      onChangeExtraField('goal', (e.target as HTMLInputElement).value);

    const dateOnChange = date => onChangeField('closeDate', date);

    return (
      <LeftContainer>
        <FormGroup>
          <ControlLabel>Close date</ControlLabel>
          <Datetime
            open={false}
            renderInput={this.renderInput}
            dateFormat="YYYY/MM/DD"
            timeFormat={false}
            value={closeDate}
            closeOnSelect={true}
            onChange={dateOnChange}
            utc={true}
          />
        </FormGroup>

        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="idea" />
              Hack Description
            </ControlLabel>
          </TitleRow>

          <FormControl
            componentClass="textarea"
            defaultValue={hackDescription}
            onChange={hackDescriptionOnChange}
          />
        </FormGroup>

        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="align-left" />
              Description
            </ControlLabel>
          </TitleRow>

          <FormControl
            componentClass="textarea"
            defaultValue={description}
            onChange={descriptionOnChange}
          />
        </FormGroup>

        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="sign-out-alt" />
              Goal
            </ControlLabel>
          </TitleRow>

          <FormControl
            componentClass="textarea"
            defaultValue={goal}
            onChange={goalOnChange}
          />
        </FormGroup>

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
