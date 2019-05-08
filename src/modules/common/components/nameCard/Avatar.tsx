import { colors } from 'modules/common/styles';
import { readFile } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IUser } from '../../../auth/types';
import { ICompany } from '../../../companies/types';

const AvatarStyled = styledTS<{
  isUser?: boolean;
  messenger?: boolean;
  twitter?: boolean;
  facebook?: boolean;
  hasAvatar?: boolean;
}>(styled.span)`
  display: block;
  max-width: 80px;
  border-radius: 40px;
  float: left;
  padding: 0;
  text-align: center;
  position: relative;
  color: ${colors.colorWhite};

  background: ${props =>
    (props.hasAvatar && 'none') ||
    (props.isUser && colors.colorCoreTeal) ||
    (props.messenger && colors.colorPrimary) ||
    (props.twitter && colors.socialTwitter) ||
    (props.facebook && colors.socialFacebook) ||
    colors.colorSecondary};

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
    props.image ? props.image : '/images/avatar.svg'})
    center no-repeat;
  background-size: cover;
`;

type Props = {
  user?: IUser;
  customer?: ICustomer;
  company?: ICompany;
  size?: number;
  icon?: React.ReactNode;
  hasAvatar?: boolean;
};

function Element({
  children,
  customer
}: {
  children: React.ReactNode;
  customer?: ICustomer;
}) {
  if (customer) {
    return (
      <Link to={customer && `/contacts/customers/details/${customer._id}`}>
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
      fontSize: `${size / 3}px`
    };
  }

  renderImage(src: string) {
    const { size } = this.props;
    return (
      <AvatarImage image={readFile(src)} style={this.generateStyle(size)} />
    );
  }

  generateTypes() {
    const { customer, hasAvatar } = this.props;

    if (customer) {
      return {
        isUser: customer.isUser,
        hasAvatar,
        messenger: customer.messengerData && true,
        twitter: customer.twitterData && true,
        facebook: customer.facebookData && true
      };
    }

    return {
      isUser: true
    };
  }

  renderInitials(fullName) {
    const { size } = this.props;

    const initials = fullName ? (
      fullName
        .split(' ')
        .slice(0, 2)
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

    return customer.firstName || customer.lastName || customer.name || null;
  }

  render() {
    const { user, customer, company, icon } = this.props;

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

    return (
      <AvatarStyled {...this.generateTypes()}>
        <Element customer={customer}>
          {avatar ? this.renderImage(avatar) : this.renderInitials(fullName)}
        </Element>
        {icon}
      </AvatarStyled>
    );
  }
}

export default Avatar;
