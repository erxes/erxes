import { IUser } from 'modules/auth/types';
import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChannelForm } from '../containers';
import { IChannel } from '../types';
import MemberAvatars from './MemberAvatars';

type Props = {
  channel: IChannel;
  members: IUser[];
  remove: (id: string) => void;
  isActive: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class ChannelRow extends React.Component<Props, {}> {
  remove = () => {
    const { remove, channel } = this.props;
    remove(channel._id);
  };

  renderEditAction = () => {
    const { channel, members, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <ChannelForm
        {...props}
        members={members}
        channel={channel}
        renderButton={renderButton}
      />
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} content={content} />
    );
  };

  render() {
    const { channel, isActive, members } = this.props;
    const selectedMemberIds = channel.memberIds || [];

    return (
      <SidebarListItem key={channel._id} isActive={isActive}>
        <Link to={`?_id=${channel._id}`}>
          {channel.name}
          <MemberAvatars
            allMembers={members}
            selectedMemberIds={selectedMemberIds}
          />
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default ChannelRow;
