import ImageWithPreview from 'modules/common/components/ImageWithPreview';
import * as React from 'react';
import xss from 'xss';
import { ContentContainer } from './styles';

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

    return attachments.map((link, index) => {
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
      if (link.includes('fna.fbcdn.net')) {
        return <ImageWithPreview alt={link} src={link} key={index} />;
      } else {
        return (
          <a href={`https://www.facebook.com/${link}`} target="_blank">
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
        <ContentContainer isComment={true}>
          {this.renderFiles(attachments)}
        </ContentContainer>
        <p
          dangerouslySetInnerHTML={{
            __html: xss(content)
          }}
        />
      </React.Fragment>
    );
  }
}
