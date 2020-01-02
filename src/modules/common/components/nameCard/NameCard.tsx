import React from 'react';
import styled from 'styled-components';
import { IUser } from '../../../auth/types';
import { colors } from '../../styles';
import Avatar from './Avatar';

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
  user: IUser;
  singleLine?: boolean;
  secondLine?: React.ReactNode;
  avatarSize?: number;
};

class NameCard extends React.Component<Props> {
  static Avatar = Avatar;

  renderFirstLine() {
    const { user } = this.props;

    if (user.details) {
      return user.details.fullName;
    }

    if (user.username) {
      return `@${user.username}`;
    }

    return null;
  }

  renderSecondLine() {
    const { user, singleLine, secondLine } = this.props;

    if (singleLine) {
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
