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
  ParticipantItemWrapper,
  FlexColumn
} from '../../styles';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  chat: any;
  type?: string;
};
type FinalProps = {
  currentUser: IUser;
} & Props;
const ParticipantList = (props: FinalProps) => {
  const { chat, currentUser, type } = props;
  const participantUserIds = chat?.participantUsers.map(user => {
    return user._id;
  });

  const renderAdd = () => {
    return (
      <ModalTrigger
        title="Add Member"
        trigger={
          <ParticipantItemWrapper isWidget={type === 'widget'}>
            <a>
              <Icon icon="plus" size={15} color="#444" />
              Add Member
            </a>
          </ParticipantItemWrapper>
        }
        content={modalProps => (
          <AddMember
            {...modalProps}
            chatId={chat._id}
            participantUserIds={participantUserIds}
          />
        )}
        isAnimate={true}
      />
    );
  };

  const isAdmin = (chat?.participantUsers || []).find(
    pUser => pUser._id === currentUser._id
  )?.isAdmin;

  return (
    <FlexColumn>
      {type !== 'widget' && <Title>Participants</Title>}
      <ParticipantListWrapper isWidget={type === 'widget'}>
        {(chat?.participantUsers || []).map(u => (
          <ParticipantItem
            key={u._id}
            chatId={chat._id}
            user={u}
            isAdmin={isAdmin}
            isWidget={type === 'widget'}
          />
        ))}
        {isAdmin && renderAdd()}
      </ParticipantListWrapper>
    </FlexColumn>
  );
};

const WithCurrentUser = withCurrentUser(ParticipantList);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
