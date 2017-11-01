import React from 'react';
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
`;

const SecondLine = styled.div`
  font-size: 13px;
  color: ${colors.colorLightGray};
`;

function NameCard({
  user,
  customer,
  firstLine,
  secondLine,
  singleLine,
  avatarSize,
  url
}) {
  let first;
  let second;

  if (user || firstLine || secondLine) {
    first = firstLine || (user.details && user.details.fullName);
    second = !singleLine && (secondLine || `@${user.username}`);
  } else if (customer) {
    first =
      firstLine ||
      customer.name ||
      (singleLine && (customer.name || customer.email || 'N/A'));
    second = !singleLine && (secondLine || customer.email || 'N/A');
  }

  return (
    <NameCardStyled>
      <Avatar user={user} customer={customer} size={avatarSize} />
      <NameCardText>
        <FirstLine href={url ? url : '#'}>{first}</FirstLine>
        <SecondLine>{second}</SecondLine>
      </NameCardText>
    </NameCardStyled>
  );
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
