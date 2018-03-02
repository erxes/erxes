import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { colors } from 'modules/common/styles';
import { NameCard, Tip, Icon } from 'modules/common/components';

const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  scrollBottom: PropTypes.func.isRequired
};

const Tweet = styled.div`
  padding: 20px 20px 20px 70px;
  border: 1px solid #eee;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  margin-bottom: 20px;
  background: #fff;
  max-width: 700px;

  > span {
    position: absolute;
    left: 20px;
    top: 20px;
  }
`;

const MessageContent = styled.div`
  margin: 10px 0;
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

  renderCounts(timeline) {
    return (
      <Counts>
        <span>
          <Icon icon="chatbubble" /> Reply • {timeline.replyCount}
        </span>
        <span>
          <Icon icon="loop" /> Retweet • {timeline.retweetCount}
        </span>
        <span>
          <Icon icon="heart" /> Favorite • {timeline.favoriteCount}
        </span>
      </Counts>
    );
  }

  renderReply(timeline) {
    const inReplyStatus = timeline.inReplyToStatusId;

    if (inReplyStatus) {
      return (
        <Reply>
          Replying to {this.renderTwitterLink(timeline.inReplyToScreenName)}
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
    const twitterUsername = twitterCustomer.screenName;
    const timeline = message.twitterData && message.twitterData.timeline;
    const messageDate = message.createdAt;

    return (
      <Tweet>
        <NameCard.Avatar customer={customer} />
        <div>
          <User>
            {this.renderTwitterLink(twitterUsername, twitterName)}
            • @{twitterUsername}
            <Tip text={moment(messageDate).format('lll')}>
              <time>
                {' '}
                {moment(messageDate)
                  .subtract(2, 'minutes')
                  .fromNow()}
              </time>
            </Tip>
          </User>
          {this.renderReply(timeline)}

          <MessageContent>{message.content}</MessageContent>

          {this.renderCounts(timeline)}
        </div>
      </Tweet>
    );
  }
}

TwitterMessage.propTypes = propTypes;

export default TwitterMessage;
