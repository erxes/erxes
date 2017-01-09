import React, { PropTypes, Component } from 'react';


const propTypes = {
  user: PropTypes.object,
  customer: PropTypes.object,
  size: PropTypes.number,
};

class Avatar extends Component {
  generateStyle(size = 40) {
    return {
      width: size,
      height: size,
      lineHeight: `${size}px`,
      borderRadius: `${size}px`,
    };
  }

  renderImage(src, alt) {
    const { size } = this.props;
    return <img src={src} alt={alt} style={this.generateStyle(size)} />;
  }

  renderInitials(fullName) {
    const { size } = this.props;
    const initials = fullName
      ? fullName.split(' ')
          .map(s => s.charAt(0))
          .join('.')
          .toUpperCase()
      : <div className="no-user" style={this.generateStyle(size)} />;

    return (
      <div style={this.generateStyle(size)}>
        {initials}
      </div>
    );
  }

  render() {
    const { user, customer } = this.props;
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
      // TODO: jump to user profile
      <a href="#" className="avatar">
        {
          avatar
            ? this.renderImage(avatar, fullName)
            : this.renderInitials(fullName)
        }
      </a>
    );
  }
}

Avatar.propTypes = propTypes;

export default Avatar;
