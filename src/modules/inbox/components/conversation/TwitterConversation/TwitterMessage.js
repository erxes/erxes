import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { colors } from 'modules/common/styles';
import { NameCard, Tip, Icon } from 'modules/common/components';
import { TweetContent, TweetMedia } from './';

const mainSize = '20px';
const borderRadius = '4px';

const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  scrollBottom: PropTypes.func.isRequired
};

const Tweet = styled.div`
  padding: ${mainSize} ${mainSize} 15px 70px;
  padding-left: ${props => props.root && mainSize};
  border: 1px solid ${colors.borderDarker};
  overflow: hidden;
  position: relative;
  margin-bottom: ${mainSize};
  background: ${props => props.root && colors.colorWhite};
  border-radius: ${borderRadius};

  > span {
    position: absolute;
    left: ${mainSize};
    top: ${mainSize};
  }

  img {
    margin-bottom: 15px;
    max-width: 100%;
  }
`;

const User = styled.div`
  color: ${colors.colorCoreGray};
  position: relative;
  padding-right: ${mainSize};
  padding-left: ${props => props.root && '50px'};
  margin-bottom: ${props => props.root && '10px'};

  > span {
    display: ${props => props.root && 'block'};

    &:before {
      content: ${props => !props.root && '• '};
    }
  }

  time {
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const Counts = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  border-top: ${props => props.root && `1px solid ${colors.borderPrimary}`};
  padding-top: ${props => props.root && '15px'};

  i {
    font-size: 14px;
    margin-right: 3px;
  }

  > span {
    margin-right: ${mainSize};
  }
`;

const Reply = styled.div`
  color: ${colors.colorCoreGray};
`;

class TwitterMessage extends Component {
  constructor(props) {
    super(props);

    this.renderReply = this.renderReply.bind(this);
    this.renderTwitterLink = this.renderTwitterLink.bind(this);
  }

  renderTwitterLink(username, fullName) {
    return (
      <a target="_blank" href={`https://twitter.com/${username}`}>
        {fullName ? <b>{fullName} </b> : `@${username}`}
      </a>
    );
  }

  renderCount(text, count, icon) {
    return (
      <span>
        <Icon icon={icon} /> {text} • {count}
      </span>
    );
  }

  renderCounts(twitterData) {
    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;

    return (
      <Counts root={inReplyStatus}>
        {this.renderCount('Reply', twitterData.reply_count || 0, 'chatbubble')}
        {this.renderCount('Retweet', twitterData.retweet_count || 0, 'loop')}
        {this.renderCount('Favorite', twitterData.favorite_count || 0, 'heart')}
        {this.renderCount('Quote', twitterData.quote_count || 0, 'quote')}
      </Counts>
    );
  }

  renderReply(twitterData, inReplyStatus) {
    if (!inReplyStatus) {
      return (
        <Reply>
          Replying to{' '}
          {this.renderTwitterLink(twitterData.in_reply_to_screen_name)}
        </Reply>
      );
    }

    return null;
  }

  render() {
    const { message, scrollBottom } = this.props;

    // customer
    const customer = message.customer || {};
    const twitterCustomer = customer.twitterData;
    const twitterName = twitterCustomer.name;
    const twitterUsername =
      twitterCustomer.screen_name || twitterCustomer.screenName;

    // twitter data
    const twitterData = message.twitterData;
    const messageDate = twitterData.created_at;
    const extendedTweet = twitterData.extended_tweet;
    const tweetContent =
      (extendedTweet && extendedTweet.full_text) || message.content;
    const entities =
      (extendedTweet && extendedTweet.entities) || twitterData.entities;

    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;

    return (
      <Tweet root={inReplyStatus}>
        <NameCard.Avatar customer={customer} />

        <User root={inReplyStatus}>
          {this.renderTwitterLink(twitterUsername, twitterName)}
          <span>@{twitterUsername}</span>
          <Tip text={moment(messageDate).format('lll')}>
            <time>
              {moment(messageDate)
                .subtract(2, 'minutes')
                .fromNow()}
            </time>
          </Tip>
        </User>
        <div>
          {this.renderReply(twitterData, inReplyStatus)}
          <TweetContent content={tweetContent} entities={entities} />
          <TweetMedia data={twitterData} scrollBottom={scrollBottom} />
          {this.renderCounts(twitterData)}
        </div>
      </Tweet>
    );
  }
}

TwitterMessage.propTypes = propTypes;

export default TwitterMessage;
