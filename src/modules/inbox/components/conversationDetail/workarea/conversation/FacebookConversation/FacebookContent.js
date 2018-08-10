import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ImageContainer } from './styles';

const propTypes = {
  content: PropTypes.string.isRequired,
  image: PropTypes.string,
  link: PropTypes.string,
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

  renderFiles(link) {
    if (!link) {
      return null;
    }

    if (link.includes('youtube.com')) {
      const iframeSrc = link.split('v=')[1].substring(0, 11);

      return (
        <iframe
          title="erxesIframe"
          src={`https://www.youtube.com/embed/${iframeSrc}`}
          width="100%"
          height="280"
          scrolling="no"
          frameBorder="0"
          allowFullScreen
        />
      );
    }

    if (
      link.endsWith('.png') ||
      link.endsWith('.jpg') ||
      link.endsWith('.jpeg')
    ) {
      return <img src={link} alt={link} />;
    }

    return (
      <iframe
        title="erxesIframe"
        src={link}
        width="100%"
        height="280"
        scrolling="no"
        frameBorder="0"
        allowFullScreen
      />
    );
  }

  render() {
    const { content, image, images, link } = this.props;

    return (
      <Fragment>
        {this.renderAttachment(image) || this.renderAttachments(images)}
        {this.renderFiles(link)}
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
