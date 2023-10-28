import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import {
  ChatActions,
  ChatActionItem,
  ParticipantItemWrapper,
  ParticipantDetails
} from '../../styles';

type Props = {
  user: any;
  makeOrRemoveAdmin: () => void;
  addOrRemoveMember: () => void;
  isAdmin: boolean;
  isWidget?: boolean;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ParticipantItem = (props: FinalProps) => {
  const { user, isAdmin, isWidget } = props;

  const renderActionButtons = () => {
    if (!isAdmin) {
      return null;
    }

    return (
      <ChatActions>
        <Tip
          text={user.isAdmin ? 'Remove as Admin' : 'Make admin'}
          placement="bottom"
        >
          <ChatActionItem onClick={props.makeOrRemoveAdmin}>
            <Icon icon="shield-slash" size={14} />
          </ChatActionItem>
        </Tip>

        <Tip text="Remove user" placement="bottom">
          <ChatActionItem onClick={props.addOrRemoveMember}>
            <Icon icon="removeuser" size={14} />
          </ChatActionItem>
        </Tip>
      </ChatActions>
    );
  };

  return (
    <ParticipantItemWrapper isWidget={isWidget}>
      <Link to={`/erxes-plugin-chat?userId=${user._id}`}>
        <Avatar user={user} size={isWidget ? 28 : 36} />
        <ParticipantDetails isWidget={isWidget}>
          <p>{user.details.fullName || user.email}</p>
          <span>
            {user.isAdmin ? 'Admin ' : ''}
            {(user.details.position && '- ' + user.details.position) || ''}
          </span>
        </ParticipantDetails>
      </Link>
      {renderActionButtons()}
    </ParticipantItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(ParticipantItem);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
