import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ImageWithPreview } from 'modules/common/components';
import { ImageContainer } from './styles';

const propTypes = {
  content: PropTypes.string.isRequired,
  image: PropTypes.string,
  link: PropTypes.string,
  images: PropTypes.array,
  commentVideo: PropTypes.string
};

export default class FacebookContent extends Component {
  renderImage(image) {
    if (!image) {
      return null;
    }

    return (
      <ImageContainer>
        <ImageWithPreview alt={image} src={image} />
      </ImageContainer>
    );
  }

  renderImages(images) {
    if (!images) {
      return null;
    }

    return (
      <ImageContainer>
        {images.map((image, index) => (
          <ImageWithPreview key={index} alt={image} src={image} full />
        ))}
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
      return (
        <ImageContainer isComment>
          <ImageWithPreview alt={link} src={link} />
        </ImageContainer>
      );
    }

    if (link.includes('xx.fbcdn.net')) {
      return (
        <iframe
          title="erxesIframeVideo"
          src={link}
          width="100%"
          height="280"
          scrolling="no"
          frameBorder="0"
          allowFullScreen
        />
      );
    }

    return (
      <a href={`https://www.facebook.com/${link}`} target="_blank">
        {link}
      </a>
    );
  }

  render() {
    const { content, image, images, link } = this.props;

    return (
      <Fragment>
        {this.renderImage(image) || this.renderImages(images)}
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
