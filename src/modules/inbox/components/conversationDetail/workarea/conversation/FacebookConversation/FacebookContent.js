import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ImageWithPreview } from 'modules/common/components';
import { ImageContainer } from './styles';

const propTypes = {
  content: PropTypes.string.isRequired,
  image: PropTypes.string,
  link: PropTypes.string,
  images: PropTypes.array,
  scrollBottom: PropTypes.func
};

export default class FacebookContent extends Component {
  renderAttachment(image) {
    if (!image) {
      return null;
    }

    return (
      <ImageContainer full>
        <ImageWithPreview
          alt={image}
          src={image}
          onLoad={this.props.scrollBottom}
        />
      </ImageContainer>
    );
  }

  renderAttachments(images) {
    if (!images) {
      return null;
    }

    return (
      <ImageContainer>
        {images.map((image, index) => (
          <ImageWithPreview
            key={index}
            alt={image}
            src={image}
            onLoad={this.props.scrollBottom}
          />
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
        <ImageWithPreview
          alt={link}
          src={link}
          onLoad={this.props.scrollBottom}
        />
      );
    }

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
