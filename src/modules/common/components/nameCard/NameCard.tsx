import * as React from 'react';
import styled from 'styled-components';
import { IUser } from '../../../auth/types';
import { ICustomer } from '../../../customers/types';
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
`;

type Props = {
  user?: IUser;
  customer?: ICustomer;
  singleLine?: boolean;
  firstLine?: React.ReactNode;
  secondLine?: React.ReactNode;
  avatarSize?: number;
  url?: string;
  isUser?: boolean;
};

class NameCard extends React.Component<Props> {
  static Avatar = Avatar;

  renderUserName() {
    const { user, singleLine, secondLine } = this.props;

    if (!user) {
      return null;
    }

    if (user.details) {
      return user.details.fullName;
    }

    if (!singleLine) {
      return secondLine || `@${user.username}`;
    }

    return null;
  }

  renderCustomerName() {
    const { customer, singleLine, secondLine } = this.props;

    if (!customer) {
      return null;
    }

    if (singleLine) {
      return customer.firstName || customer.primaryEmail || 'Unknown';
    }

    if (!singleLine) {
      return secondLine || customer.primaryEmail || 'Unknown';
    }

    return null;
  }

  render() {
    const { user, customer, firstLine, secondLine, avatarSize } = this.props;
    let first;
    let second;

    if (user || firstLine || secondLine) {
      first = firstLine || this.renderUserName();
      second = secondLine || (user && user.email) || this.renderUserName();
    }

    if (customer) {
      first = firstLine || customer.firstName || this.renderCustomerName();
      second = this.renderCustomerName();
    }

    return (
      <NameCardStyled>
        <Avatar user={user} customer={customer} size={avatarSize} />
        <NameCardText>
          <FirstLine>{first}</FirstLine>
          <SecondLine>{second}</SecondLine>
        </NameCardText>
      </NameCardStyled>
    );
  }
}

export default NameCard;
