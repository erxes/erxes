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
  onChangeExtraField: (name: 'hackDescription' | 'goal', value: any) => void;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
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
      onBlurFields,
      attachments,
      onChangeAttachment,
      description,
      hackDescription,
      goal,
      type
    } = this.props;

    const onChange = e =>
      onChangeField(e.target.name, (e.target as HTMLInputElement).value);

    const onChangeExtra = e =>
      onChangeExtraField(e.target.name, (e.target as HTMLInputElement).value);

    const onSave = e => {
      onBlurFields(e.target.name, e.target.value);
    };

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
            name="hackDescription"
            defaultValue={hackDescription}
            onChange={onChangeExtra}
            onBlur={onSave}
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
            name="description"
            defaultValue={description}
            onChange={onChange}
            onBlur={onSave}
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
            name="goal"
            onChange={onChangeExtra}
            onBlur={onSave}
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
