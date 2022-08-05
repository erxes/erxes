import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';

import Button from '@erxes/ui/src/components/Button';
import ChannelForm from '@erxes/ui-inbox/src/settings/channels/containers/ChannelForm';
import { FieldStyle } from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IChannel } from '@erxes/ui-inbox/src/settings/channels/types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import MemberAvatars from '@erxes/ui/src/components/MemberAvatars';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

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
    const { channel, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <ChannelForm {...props} channel={channel} renderButton={renderButton} />
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
          <FieldStyle>
            {channel.name}
            <MemberAvatars
              allMembers={members}
              selectedMemberIds={selectedMemberIds}
            />
          </FieldStyle>
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default ChannelRow;
