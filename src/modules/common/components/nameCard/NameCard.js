import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

class NameCard extends Component {
  renderUserName() {
    const { user, singleLine, secondLine } = this.props;

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

    if (singleLine) {
      return customer.name || customer.primaryEmail || 'N/A';
    }

    if (!singleLine) {
      return secondLine || customer.primaryEmail || 'N/A';
    }

    return null;
  }

  render() {
    const { user, customer, firstLine, secondLine, avatarSize } = this.props;
    let first;
    let second;

    if (user || firstLine || secondLine) {
      first = firstLine || this.renderUserName();
      second = this.renderUserName();
    }

    if (customer) {
      first = firstLine || customer.name || this.renderCustomerName();
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

NameCard.propTypes = {
  user: PropTypes.object,
  customer: PropTypes.object,
  singleLine: PropTypes.bool,
  firstLine: PropTypes.node,
  secondLine: PropTypes.node,
  avatarSize: PropTypes.number,
  url: PropTypes.string,
  isUser: PropTypes.bool
};

NameCard.Avatar = Avatar;

export default NameCard;
