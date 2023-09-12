import Avatar from "./Avatar";
import React from "react";
import { colors } from "../../styles";
import styled from "styled-components";

const NameCardStyled = styled.div`
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const NameCardText = styled.div`
  margin-left: 10px;
`;

const FirstLine = styled.a`
  padding: 0;
  display: block;
  color: ${colors.colorCoreDarkGray};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-decoration: inherit;

  &:hover {
    color: initial;
  }
`;

const SecondLine = styled.div`
  font-size: 12px;
  color: ${colors.colorLightGray};
  white-space: nowrap;
`;

type Props = {
  user;
  singleLine?: boolean;
  secondLine?: React.ReactNode;
  avatarSize?: number;
};

class NameCard extends React.Component<Props> {
  static Avatar = Avatar;

  renderFirstLine() {
    const { user } = this.props;

    if (!user) {
      return null;
    }

    if (user.details) {
      return (
        user.details.fullName ||
        `${user.details.firstName} ${user.details.lastName}`
      );
    }

    if (user.username) {
      return `@${user.username}`;
    }

    return null;
  }

  renderSecondLine() {
    const { user, singleLine, secondLine } = this.props;

    if (singleLine || !user) {
      return null;
    }

    return secondLine || user.email || null;
  }

  render() {
    const { user, avatarSize } = this.props;

    return (
      <NameCardStyled>
        <Avatar user={user} size={avatarSize} />
        <NameCardText>
          <FirstLine>{this.renderFirstLine()}</FirstLine>
          <SecondLine>{this.renderSecondLine()}</SecondLine>
        </NameCardText>
      </NameCardStyled>
    );
  }
}

export default NameCard;
