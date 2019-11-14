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
import { extractAttachment } from 'modules/common/utils';
import { IGrowthHack } from 'modules/growthHacks/types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Votes from './Votes';

type Props = {
  item: IGrowthHack;
  saveItem: (doc: { [key: string]: any }) => void;
  type: string;
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
    const { item, saveItem, type } = this.props;

    const onDescriptionBlur = e => {
      const value = e.target.value;

      if (item.description !== value) {
        saveItem({ description: value });
      }
    };

    const onUserChange = usrs => saveItem({ assignedUserIds: usrs });
    const assignedUserIds = item.assignedUsers.map(user => user._id);

    const onAttachmentChange = (files: IAttachment[]) =>
      saveItem({ attachments: files });
    const attachments =
      (item.attachments && extractAttachment(item.attachments)) || [];

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
            onSelect={onUserChange}
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
            defaultValue={item.description}
            onBlur={onDescriptionBlur}
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
            onChange={onAttachmentChange}
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
