import ImageWithPreview from '@erxes/ui/src/components/ImageWithPreview';
import { readFile } from '@erxes/ui/src/utils/core';
import * as React from 'react';
import { ContentContainer, FacebookContentMessage } from './styles';

type Props = {
  content: string;
  attachments: string[];
  commentVideo?: string;
  scrollBottom?: () => void;
};

export default class FacebookContent extends React.Component<Props, {}> {
  renderFiles(attachments?: string[]) {
    if (!attachments) {
      return null;
    }

    const { scrollBottom } = this.props;

    return attachments.map((link, index) => {
      if (link.includes('youtube.com')) {
        const iframeSrc = link.split('v=')[1].substring(0, 11);

        return (
          <iframe
            key={index}
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

      if (link.includes('xx.fbcdn.net')) {
        return (
          <iframe
            key={index}
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
      if (link.includes('fna.fbcdn.net')) {
        return (
          <ImageWithPreview
            alt={link}
            src={link}
            key={index}
            onLoad={scrollBottom}
          />
        );
      }
      if (link.includes('jpg')) {
        return (
          <ImageWithPreview
            alt={link}
            src={link}
            key={index}
            onLoad={scrollBottom}
          />
        );
      }
      if (link.includes('mp4')) {
        return (
          <video width="320" height="240" controls={true}>
            <source src={readFile(link)} type="video/mp4" />
          </video>
        );
      } else {
        return (
          <a
            key={index}
            href={`https://www.facebook.com/${link}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link}
          </a>
        );
      }
    });
  }

  render() {
    const { content, attachments } = this.props;

    return (
      <React.Fragment>
        <FacebookContentMessage>{content}</FacebookContentMessage>
        <ContentContainer isComment={true}>
          {this.renderFiles(attachments)}
        </ContentContainer>
      </React.Fragment>
    );
  }
}
