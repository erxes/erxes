import Autolinker from "autolinker";
import * as React from "react";
import styled from "styled-components";

type Props = {
  content: string;
  entities: any;
};

const MessageContent = styled.div`
  margin: 5px 0 10px 0;

  a {
    font-weight: bold;
  }
`;

class TweetContent extends React.Component<Props, {}> {
  renderContent() {
    const { entities } = this.props;
    let { content } = this.props;
    const { user_mentions, hashtags, urls } = entities;
    let options = {};

    if (user_mentions.length) {
      user_mentions.forEach(mention => {
        content = content.replace(
          `@${mention.screen_name}`,
          `<a title='${
            mention.name
          }' target="_blank" href='https://twitter.com/${mention.screen_name}'>
            @${mention.screen_name}
          </a>`
        );
      });
    }

    if (hashtags.length) {
      options = { hashtag: "twitter" };
    }

    if (urls.length) {
      urls.forEach(link => {
        content = content.replace(
          `${link.url}`,
          `<a target="_blank" href='${link.expanded_url}'>
            ${link.display_url}
          </a>`
        );
      });
    }

    return Autolinker.link(content, options);
  }

  render() {
    return (
      <MessageContent
        dangerouslySetInnerHTML={{
          __html: this.renderContent()
        }}
      />
    );
  }
}

export default TweetContent;
