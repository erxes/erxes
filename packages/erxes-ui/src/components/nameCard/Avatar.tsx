import { colors } from '../../styles';
import { rgba } from '../../styles/ecolor';
import { readFile } from '../../utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Tip from '../Tip';

const AvatarStyled = styledTS<{ state?: string }>(styled.span)`
  display: block;
  max-width: 80px;
  border-radius: 40px;
  float: left;
  padding: 0;
  text-align: center;
  position: relative;
  color: ${colors.colorWhite};

  background: ${props =>
    (props.state === 'lead' && rgba(colors.colorCoreYellow, 0.8)) ||
    (props.state === 'visitor' && rgba(colors.colorLightGray, 0.6)) ||
    (props.state === 'customer' && rgba(colors.colorCoreTeal, 0.8)) ||
    rgba(colors.colorSecondary, 0.8)};

  > span {
    position: absolute;
    right: -5px;
    bottom: -2px;
  }

  a {
    color: ${colors.colorWhite};
    display: block;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorWhite};
      opacity: 0.8;
    }
  }
`;

const AvatarImage = styledTS<{ image?: string }>(styled.div)`
  background: url(${props =>
    props.image ? `"${props.image}"` : '/images/avatar.svg'})
    center no-repeat;
  background-size: cover;
`;

type Props = {
  user?;
  customer?;
  company?;
  size?: number;
  icon?: React.ReactNode;
  letterCount?: number;
  showTip?: boolean;
};

function Element({
  children,
  customer
}: {
  children: React.ReactNode;
  customer?;
}) {
  if (customer) {
    return (
      <Link to={customer && `/contacts/details/${customer._id}`}>
        {children}
      </Link>
    );
  }
  return <div>{children}</div>;
}

class Avatar extends React.Component<Props> {
  generateStyle(size: number = 40) {
    return {
      width: size,
      height: size,
      lineHeight: `${size}px`,
      borderRadius: `${size}px`,
      fontSize: `${size / 3}px`,
      fontWeight: 600
    };
  }

  renderImage(src: string) {
    const { size } = this.props;
    return (
      <AvatarImage image={readFile(src)} style={this.generateStyle(size)} />
    );
  }

  generateTypes() {
    const { customer } = this.props;

    if (customer) {
      return {
        state: customer.state
      };
    }

    return {
      state: true
    };
  }

  renderInitials(fullName) {
    const { size, letterCount = 2 } = this.props;

    const initials = fullName ? (
      fullName
        .split(' ')
        .slice(0, letterCount)
        .map(s => s.charAt(0))
        .join('.')
        .toUpperCase()
    ) : (
      <AvatarImage style={this.generateStyle(size)} />
    );

    return <div style={this.generateStyle(size)}>{initials}</div>;
  }

  renderCustomerName(customer) {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }

    return (
      customer.firstName ||
      customer.lastName ||
      customer.name ||
      customer.middleName ||
      null
    );
  }

  render() {
    const { user, customer, company, icon, showTip } = this.props;

    let avatar;
    let fullName;

    if (user) {
      const { details } = user;
      avatar = details && details.avatar;
      fullName = details && details.fullName;
    }

    if (customer) {
      avatar = customer.avatar;
      fullName = this.renderCustomerName(customer);
    }

    if (company) {
      avatar = company.avatar;
      fullName = company.primaryName || null;
    }
    const renderContent = (
      <AvatarStyled state={customer && customer.state}>
        <Element customer={customer}>
          {avatar ? this.renderImage(avatar) : this.renderInitials(fullName)}
        </Element>
        {icon}
      </AvatarStyled>
    );

    return showTip ? <Tip text={fullName}>{renderContent}</Tip> : renderContent;
  }
}

export default Avatar;
