import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AvatarStyled = styled.a`
  display: block;
  max-width: 80px;
  border-radius: 40px;
  float: left;
  padding: 0;
`;

const DefaultAvatar = styled.div`
  background: url('/images/userDefaultIcon.png') center no-repeat;
  background-size: 100%;
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

  renderImage(src, alt) {
    const { size } = this.props;
    return <img src={src} alt={alt} style={this.generateStyle(size)} />;
  }

  renderInitials(fullName) {
    const { size } = this.props;
    const initials = fullName ? (
      fullName
        .split(' ')
        .map(s => s.charAt(0))
        .join('.')
        .toUpperCase()
    ) : (
      <DefaultAvatar style={this.generateStyle(size)} />
    );

    return <div style={this.generateStyle(size)}>{initials}</div>;
  }

  render() {
    const { user, customer, url = '#' } = this.props;

    let avatar;
    let fullName;

    if (user) {
      const { details } = user;
      avatar = details && details.avatar;
      fullName = details && details.fullName;
    } else if (customer) {
      avatar = customer.avatar;
      fullName = customer.name;
    }

    return (
      <AvatarStyled href={url}>
        {avatar
          ? this.renderImage(avatar, fullName)
          : this.renderInitials(fullName)}
      </AvatarStyled>
    );
  }
}

Avatar.propTypes = {
  user: PropTypes.object,
  customer: PropTypes.object,
  size: PropTypes.number,
  url: PropTypes.string
};

export default Avatar;
