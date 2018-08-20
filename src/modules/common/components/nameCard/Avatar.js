import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const AvatarStyled = styled.span`
  display: block;
  max-width: 80px;
  border-radius: 40px;
  float: left;
  padding: 0;
  text-align: center;
  position: relative;
  color: ${colors.colorWhite};

  background: ${props =>
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

const AvatarImage = styled.div`
  background: url(${props =>
      props.image ? props.image : '/images/avatar.svg'})
    center no-repeat;
  background-size: cover;
`;

class Avatar extends Component {
  generateStyle(size = 40) {
    return {
      width: size,
      height: size,
      lineHeight: `${size}px`,
      borderRadius: `${size}px`,
      fontSize: `${size / 3}px`
    };
  }

  renderImage(src) {
    const { size } = this.props;
    return <AvatarImage image={src} style={this.generateStyle(size)} />;
  }

  generateTypes() {
    const { customer } = this.props;

    if (customer) {
      return {
        isUser: customer.isUser,
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

  renderName(customer) {
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
    } else if (customer) {
      avatar = customer.avatar;
      fullName = this.renderName(customer);
    } else if (company) {
      avatar = company.avatar;
      fullName = this.renderName(company);
    }

    const Element = customer ? Link : 'div';

    return (
      <AvatarStyled {...this.generateTypes()}>
        <Element to={customer && `/customers/details/${customer._id}`}>
          {avatar ? this.renderImage(avatar) : this.renderInitials(fullName)}
        </Element>
        {icon}
      </AvatarStyled>
    );
  }
}

Avatar.propTypes = {
  user: PropTypes.object,
  customer: PropTypes.object,
  company: PropTypes.object,
  size: PropTypes.number,
  icon: PropTypes.node
};

export default Avatar;
