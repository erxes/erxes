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
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ParticipantItem = (props: FinalProps) => {
  const { user, currentUser } = props;
  const actionsRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    if (actionsRef && actionsRef.current) {
      actionsRef.current.style.display = 'inline-block';
    }
  };

  const handleMouseLeave = () => {
    if (actionsRef && actionsRef.current) {
      actionsRef.current.style.display = 'none';
    }
  };

  return (
    <ParticipantItemWrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/erxes-plugin-chat?userId=${user._id}`}>
        <Avatar user={user} size={36} />
        <ParticipantDetails>
          <p>{user.details.fullName || user.email}</p>
          <span>
            {user.isAdmin ? 'Admin ' : ''}
            {(user.details.position && '- ' + user.details.position) || ''}
          </span>
        </ParticipantDetails>
      </Link>
      {user.isAdmin && user._id === currentUser._id && (
        <ChatActions innerRef={actionsRef}>
          {user.isAdmin ? (
            <Tip text="Remove as Admin" placement="bottom">
              <ChatActionItem onClick={props.makeOrRemoveAdmin}>
                <Icon icon="shield-slash" size={14} />
              </ChatActionItem>
            </Tip>
          ) : (
            <Tip text="Make admin" placement="bottom">
              <ChatActionItem onClick={props.makeOrRemoveAdmin}>
                <Icon icon="shield-slash" size={14} />
              </ChatActionItem>
            </Tip>
          )}
          <Tip text="Remove user" placement="bottom">
            <ChatActionItem onClick={props.addOrRemoveMember}>
              <Icon icon="removeuser" size={14} />
            </ChatActionItem>
          </Tip>
        </ChatActions>
      )}
    </ParticipantItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(ParticipantItem);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
