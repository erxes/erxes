import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  content: PropTypes.string.isRequired,
  entities: PropTypes.object
};

const MessageContent = styled.div`
  margin: 5px 0 10px 0;
  max-width: 640px;

  a {
    font-weight: bold;
  }
`;

class TweetContent extends Component {
  renderContent() {
    const { entities } = this.props;
    let { content } = this.props;
    const mentions = entities.user_mentions;
    const hashtags = entities.hashtags;

    if (mentions.length) {
      mentions.forEach(mention => {
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

    if (hashtags) {
      content = content.replace(
        /(^|\s)#(\w+)/g,
        "$1<a target='_blank' href='https://twitter.com/hashtag/$2'>#$2</a>"
      );
    }

    return content;
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

TweetContent.propTypes = propTypes;

export default TweetContent;
