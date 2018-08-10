import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  content: PropTypes.string.isRequired,
  image: PropTypes.string
};

class FacebookContent extends Component {
  renderAttachments(image) {
    if (!image) {
      return null;
    }

    return <img src={image} alt={image} />;
  }

  render() {
    const { content, image } = this.props;

    return (
      <Fragment>
        {this.renderAttachments(image)}
        <p
          dangerouslySetInnerHTML={{
            __html: content
          }}
        />
      </Fragment>
    );
  }
}

FacebookContent.propTypes = propTypes;

export default FacebookContent;
