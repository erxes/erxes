import React from "react";
// erxes
import Avatar from "../../../../common/nameCard/Avatar";
import Tip from "../../../../common/Tip";
import Icon from "../../../../common/Icon";
import withCurrentUser from "../../../../auth/containers/withCurrentUser";
import { IUser } from "../../../../types";
// local
import {
  ChatActions,
  ChatActionItem,
  ParticipantItemWrapper,
  ParticipantDetails,
} from "../../../styles";

type Props = {
  user: any;
  makeOrRemoveAdmin: () => void;
  addOrRemoveMember: () => void;
  isAdmin: boolean;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ParticipantItem = (props: FinalProps) => {
  const { user, isAdmin } = props;

  const renderActionButtons = () => {
    if (!isAdmin) return null;

    return (
      <ChatActions>
        <Tip
          text={user.isAdmin ? "Remove as Admin" : "Make admin"}
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
    <ParticipantItemWrapper>
      <Avatar user={user} size={36} />
      <ParticipantDetails>
        <p>{user.details.fullName || user.email}</p>
        <span>
          {user.isAdmin ? "Admin " : ""}
          {(user.details.position && "- " + user.details.position) || ""}
        </span>
      </ParticipantDetails>
      {renderActionButtons()}
    </ParticipantItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(ParticipantItem);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
