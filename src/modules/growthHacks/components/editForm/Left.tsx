import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { TitleRow } from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { IGrowthHack } from 'modules/growthHacks/types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Votes from './Votes';

type Props = {
  item: IGrowthHack;
  onChangeField: (
    name: 'description' | 'closeDate' | 'assignedUserIds',
    value: any
  ) => void;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
  type: string;
  assignedUserIds: string[];
  description: string;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  attachments: IAttachment[];
  options: IOptions;
};

class Left extends React.Component<Props> {
  renderVoters() {
    const { item } = this.props;

    if (item.voteCount === 0) {
      return null;
    }

    return (
      <FormGroup>
        <TitleRow>
          <ControlLabel>
            <Icon icon="thumbs-up" />
            Votes
          </ControlLabel>
        </TitleRow>
        <Votes count={item.voteCount || 0} users={item.votedUsers || []} />
      </FormGroup>
    );
  }

  render() {
    const {
      item,
      onChangeField,
      onBlurFields,
      attachments,
      onChangeAttachment,
      description,
      type,
      assignedUserIds
    } = this.props;

    const onChange = e =>
      onChangeField(e.target.name, (e.target as HTMLInputElement).value);

    const onSave = e => {
      onBlurFields(e.target.name, e.target.value);
    };

    const userOnChange = usrs => onChangeField('assignedUserIds', usrs);

    return (
      <>
        {this.renderVoters()}

        <FormGroup>
          <TitleRow>
            <ControlLabel>
              <Icon icon="user-check" />
              Assign to
            </ControlLabel>
          </TitleRow>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            value={assignedUserIds}
            onSelect={userOnChange}
            filterParams={{ status: 'verified' }}
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
              <Icon icon="paperclip" />
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
