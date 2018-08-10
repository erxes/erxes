import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ImageContainer } from './styles';

const propTypes = {
  content: PropTypes.string.isRequired,
  image: PropTypes.string,
  video: PropTypes.string,
  images: PropTypes.array
};

export default class FacebookContent extends Component {
  renderAttachment(image) {
    if (!image) {
      return null;
    }

    return (
      <ImageContainer full>
        <img src={image} alt={image} />
      </ImageContainer>
    );
  }

  renderAttachments(images) {
    if (!images) {
      return null;
    }

    return (
      <ImageContainer>
        {images.map(image => <img key={image} src={image} alt={image} />)}
      </ImageContainer>
    );
  }

  renderVideo(iframeSrc) {
    if (!iframeSrc) {
      return null;
    }

    return (
      <iframe
        title="erxesIframe"
        src={iframeSrc}
        width="480"
        height="280"
        scrolling="no"
        frameBorder="0"
        allowtransparency="true"
      />
    );
  }

  render() {
    const { content, image, images, video } = this.props;

    return (
      <Fragment>
        {this.renderAttachment(image) || this.renderAttachments(images)}
        {this.renderVideo(video)}
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
