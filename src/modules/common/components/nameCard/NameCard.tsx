import React from 'react';
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

type Props = {
  user?: IUser;
  customer?: ICustomer;
  singleLine?: boolean;
  firstLine?: React.ReactNode;
  avatarSize?: number;
  url?: string;
  isUser?: boolean;
};

class NameCard extends React.Component<Props> {
  static Avatar = Avatar;

  renderUserName() {
    const { user } = this.props;

    if (!user) {
      return null;
    }

    if (user.details) {
      return user.details.fullName;
    }

    return null;
  }

  renderCustomerName() {
    const { customer, singleLine } = this.props;

    if (!customer) {
      return null;
    }

    if (singleLine) {
      return customer.firstName || customer.primaryEmail || 'Unknown';
    }

    return null;
  }

  render() {
    const { user, customer, firstLine, avatarSize } = this.props;
    let first;

    if (user || firstLine) {
      first = firstLine || this.renderUserName();
    }

    if (customer) {
      first = firstLine || customer.firstName || this.renderCustomerName();
    }

    return (
      <NameCardStyled>
        <Avatar user={user} customer={customer} size={avatarSize} />
        <NameCardText>
          <FirstLine>{first}</FirstLine>
        </NameCardText>
      </NameCardStyled>
    );
  }
}

export default NameCard;
