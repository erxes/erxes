import { ImageWithPreview } from 'modules/common/components';
import * as React from 'react';
import * as xss from 'xss';
import { ImageContainer } from './styles';

type Props = {
  content: string;
  image?: string;
  link?: string;
  images?: string[];
  commentVideo?: string;
  scrollBottom?: () => void;
};

export default class FacebookContent extends React.Component<Props, {}> {
  renderImage(image?: string) {
    if (!image) {
      return null;
    }

    const { scrollBottom } = this.props;

    return (
      <ImageContainer>
        <ImageWithPreview alt={image} src={image} onLoad={scrollBottom} />
      </ImageContainer>
    );
  }

  renderImages(images?: string[]) {
    if (!images) {
      return null;
    }

    const { scrollBottom } = this.props;

    return (
      <ImageContainer>
        {images.map((image, index) => (
          <ImageWithPreview
            key={index}
            alt={image}
            src={image}
            onLoad={scrollBottom}
            full={true}
          />
        ))}
      </ImageContainer>
    );
  }

  renderFiles(link?: string) {
    if (!link) {
      return null;
    }

    const { scrollBottom } = this.props;
    let href = link;

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
          allowFullScreen={true}
        />
      );
    }

    if (
      link.endsWith('.png') ||
      link.endsWith('.jpg') ||
      link.endsWith('.jpeg')
    ) {
      return (
        <ImageContainer isComment={true}>
          <ImageWithPreview alt={link} src={link} onLoad={scrollBottom} />
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
          allowFullScreen={true}
        />
      );
    }

    if (!link.startsWith('https://')) {
      href = `https://www.facebook.com/${link}`;
    }

    return (
      <a href={href} target="_blank">
        {link}
      </a>
    );
  }

  render() {
    const { content, image, images, link } = this.props;

    return (
      <React.Fragment>
        {this.renderImage(image) || this.renderImages(images)}
        {this.renderFiles(link)}
        <p
          dangerouslySetInnerHTML={{
            __html: xss(content)
          }}
        />
      </React.Fragment>
    );
  }
}
