import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { colors } from 'modules/common/styles';
import { NameCard, Tip, Icon } from 'modules/common/components';
import { TweetContent } from './';

const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  scrollBottom: PropTypes.func.isRequired
};

const Tweet = styled.div`
  padding: 20px 20px 15px 70px;
  border: 1px solid #dee4e7;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 3px;

  > span {
    position: absolute;
    left: 20px;
    top: 20px;
  }
`;

const User = styled.div`
  color: ${colors.colorCoreGray};
  position: relative;
  padding-right: 20px;

  time {
    position: absolute;
    right: 0;
  }
`;

const Counts = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;

  i {
    font-size: 14px;
    margin-right: 3px;
  }

  > span {
    margin-right: 20px;
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

  renderCounts(twitterData) {
    return (
      <Counts>
        <span>
          <Icon icon="chatbubble" /> Reply • {twitterData.reply_count || 0}
        </span>
        <span>
          <Icon icon="loop" /> Retweet • {twitterData.retweet_count || 0}
        </span>
        <span>
          <Icon icon="heart" /> Favorite • {twitterData.favorite_count || 0}
        </span>
        <span>
          <Icon icon="quote" /> Quote • {twitterData.quote_count || 0}
        </span>
      </Counts>
    );
  }

  renderReply(twitterData) {
    const inReplyStatus = twitterData.in_reply_to_status_id;

    if (inReplyStatus) {
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
    const { message } = this.props;
    const customer = message.customer || {};
    const twitterCustomer = customer.twitterData;
    const twitterName = twitterCustomer.name;
    const twitterUsername =
      twitterCustomer.screen_name || twitterCustomer.screenName;
    const twitterData = message.twitterData;
    const messageDate = twitterData.created_at;

    return (
      <Tweet>
        <NameCard.Avatar customer={customer} />
        <div>
          <User>
            {this.renderTwitterLink(twitterUsername, twitterName)}
            • @{twitterUsername}
            <Tip text={moment(messageDate).format('lll')}>
              <time>
                {moment(messageDate)
                  .subtract(2, 'minutes')
                  .fromNow()}
              </time>
            </Tip>
          </User>
          {this.renderReply(twitterData)}
          <TweetContent
            content={message.content}
            entities={twitterData.entities}
          />
          {this.renderCounts(twitterData)}
        </div>
      </Tweet>
    );
  }
}

TwitterMessage.propTypes = propTypes;

export default TwitterMessage;
