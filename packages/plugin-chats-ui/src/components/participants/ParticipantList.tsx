import React from 'react';
// erxes
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
// local
import ParticipantItem from '../../containers/participants/ParticipantItem';
import AddMember from '../../containers/modals/AddMember';
import {
  Title,
  ParticipantListWrapper,
  ParticipantItemWrapper
  // ParticipantDetails,
  // ParticipantSubDetails
} from '../../styles';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  chat: any;
};
type FinalProps = {
  currentUser: IUser;
} & Props;
const ParticipantList = (props: FinalProps) => {
  const { chat, currentUser } = props;
  const participantUserIds = chat?.participantUsers.map(user => {
    return user._id;
  });

  const renderAdd = () => {
    return (
      <ModalTrigger
        title="Add people"
        trigger={
          <ParticipantItemWrapper>
            <a href="#">
              <Icon
                icon="plus"
                size={16}
                color="black"
                style={{ margin: '0 0.6em' }}
              />
              Add Member
            </a>
          </ParticipantItemWrapper>
        }
        content={props => (
          <AddMember
            {...props}
            chatId={chat._id}
            participantUserIds={participantUserIds}
          />
        )}
        isAnimate
        hideHeader
      />
    );
  };
  const isAdmin = (chat?.participantUsers || []).find(
    pUser => pUser._id === currentUser._id
  )?.isAdmin;

  return (
    <>
      <Title>Participants</Title>
      <ParticipantListWrapper>
        {(chat?.participantUsers || []).map(u => (
          <ParticipantItem
            key={u._id}
            chatId={chat._id}
            user={u}
            isAdmin={isAdmin}
          />
        ))}
        {isAdmin && renderAdd()}
      </ParticipantListWrapper>
    </>
  );
};

const WithCurrentUser = withCurrentUser(ParticipantList);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
