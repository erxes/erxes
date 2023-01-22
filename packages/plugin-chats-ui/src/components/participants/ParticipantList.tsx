import React from 'react';
// erxes
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
// local
import ParticipantItem from '../../containers/participants/ParticipantItem';
import AddMember from '../../containers/modals/AddMember';
import {
  SidebarHeader,
  Title,
  ParticipantListWrapper,
  ParticipantItemWrapper
  // ParticipantDetails,
  // ParticipantSubDetails
} from '../../styles';

type Props = {
  chat: any;
};

const ParticipantList = (props: Props) => {
  const { chat } = props;

  const renderAdd = () => {
    <ModalTrigger
      title="Add people"
      trigger={
        <ParticipantItemWrapper>
          <a href="#">
            <Icon
              icon="plus"
              size={18}
              color="black"
              style={{ margin: '0 0.6em' }}
            />
          </a>
        </ParticipantItemWrapper>
      }
      content={props => <AddMember {...props} chatId={chat._id} />}
      hideHeader
      isAnimate
    />;
  };

  return (
    <>
      <Title>Participants</Title>
      <ParticipantListWrapper>
        {(chat.participantUsers || []).map(u => (
          <ParticipantItem key={u._id} chatId={chat._id} user={u} />
        ))}
        {renderAdd()}
      </ParticipantListWrapper>
    </>
  );
};

export default ParticipantList;
