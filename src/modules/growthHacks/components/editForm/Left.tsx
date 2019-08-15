import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { TitleRow } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import React from 'react';

type Props = {
  item: IItem;
  onChangeField: (name: 'description' | 'closeDate', value: any) => void;
  onChangeExtraField: (
    name: 'hackDescription' | 'goal' | 'priority',
    value: any
  ) => void;
  type: string;
  description: string;
  hackDescription: string;
  goal: string;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  attachments: IAttachment[];
  options: IOptions;
};

class Left extends React.Component<Props> {
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

    return (
      <>
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
      </>
    );
  }
}

export default Left;
