import React from "react";
// erxes
import ModalTrigger from "../../../../common/ModalTrigger";
import Icon from "../../../../common/Icon";
// local
import ParticipantItem from "../../../containers/chat/participants/ParticipantItem";
import AddMember from "../../../containers/chat/AddMember";
import {
  Title,
  ParticipantListWrapper,
  ParticipantItemWrapper,
} from "../../../styles";
import withCurrentUser from "../../../../auth/containers/withCurrentUser";
import { IUser } from "../../../../types";

type Props = {
  chat: any;
};
type FinalProps = {
  currentUser: IUser;
} & Props;
const ParticipantList = (props: FinalProps) => {
  const { chat, currentUser } = props;
  const participantUserIds = chat?.participantUsers.map((user) => {
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
                size={13}
                color="black"
                style={{ margin: "0 0.6em" }}
              />
              Add Member
            </a>
          </ParticipantItemWrapper>
        }
        content={(p) => (
          <AddMember
            {...p}
            chatId={chat._id}
            participantUserIds={participantUserIds}
          />
        )}
        isAnimate={true}
        hideHeader={true}
      />
    );
  };
  const isAdmin = (chat?.participantUsers || []).find(
    (pUser) => pUser._id === currentUser._id
  )?.isAdmin;

  return (
    <>
      <Title>Group members</Title>
      <ParticipantListWrapper>
        {(chat?.participantUsers || []).map((u) => (
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
