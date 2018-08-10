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

    return <img src={image} alt={image} />;
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
        src={iframeSrc}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        title="1"
        allowFullScreen
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
