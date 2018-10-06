import { Icon, ModalTrigger, NameCard, Tip } from 'modules/common/components';
import * as moment from 'moment';
import * as React from 'react';
import { ICustomer } from '../../../../../../customers/types';
import { IAddMessage } from '../../../../../containers/conversationDetail/WorkArea';
import { IMessage, ITwitterData } from '../../../../../types';
import { ModalAction, TweetContent, TweetMedia } from './';
import { Count, Counts, Reply, Time, Tweet, User } from './styles';

type Props = {
  message: IMessage;
  staff?: boolean;
  integrationId: string;
  favoriteTweet: (
    data: { integrationId: string; id: string },
    callback?: () => void
  ) => void;
  retweet: (
    data: {
      integrationId: string;
      id: string;
    },
    callback: () => void
  ) => void;
  replyTweet: (data: IAddMessage, callback: () => void) => void;
  tweet: (
    data: {
      integrationId: string;
      text: string;
    },
    callback: () => void
  ) => void;
  scrollBottom: () => void;
};

class TwitterMessage extends React.Component<Props, {}> {
  constructor(props) {
    super(props);

    this.renderReply = this.renderReply.bind(this);
    this.renderTweetLink = this.renderTweetLink.bind(this);
    this.renderUserLink = this.renderUserLink.bind(this);
    this.favoriteTweet = this.favoriteTweet.bind(this);
  }

  favoriteTweet() {
    const { message, favoriteTweet, integrationId } = this.props;
    const twitterData = message.twitterData;

    if (!twitterData) return null;

    const tweet = {
      integrationId,
      id: twitterData.id_str
    };

    return favoriteTweet(tweet);
  }

  renderUserLink(username?: string, fullName?: string, customer?: ICustomer) {
    if (!username) {
      return <div>{customer && customer.firstName}</div>;
    }

    return (
      <a target="_blank" href={`https://twitter.com/${username}`}>
        {fullName ? <b>{fullName} </b> : `@${username}`}
      </a>
    );
  }

  renderTweetLink() {
    const { message } = this.props;

    if (!message.twitterData) {
      return null;
    }

    const messageDate = message.twitterData.created_at;
    const idStr = message.twitterData.id_str;

    return (
      <Tip text={moment(messageDate).format('lll')}>
        <Time href={`https://twitter.com/statuses/${idStr}`} target="_blank">
          {moment(messageDate).fromNow()}
        </Time>
      </Tip>
    );
  }

  renderCounts(twitterData: ITwitterData) {
    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;
    const { favorited, retweeted } = twitterData;
    const { integrationId, retweet, replyTweet, tweet, message } = this.props;

    return (
      <Counts root={inReplyStatus}>
        <ModalTrigger
          title="Reply tweet"
          trigger={
            <Count>
              <Icon icon="chat" /> Reply • {twitterData.reply_count || 0}
            </Count>
          }
          content={props => (
            <ModalAction
              type="reply"
              integrationId={integrationId}
              replyTweet={replyTweet}
              parentMessage={message}
              {...props}
            />
          )}
        />

        <ModalTrigger
          title="Retweet"
          trigger={
            <Count retweeted={retweeted}>
              <Icon icon="repeat" /> Retweet • {twitterData.retweet_count || 0}
            </Count>
          }
          content={props => (
            <ModalAction
              type="retweet"
              integrationId={integrationId}
              retweet={retweet}
              parentMessage={message}
              {...props}
            />
          )}
        />

        <Count favorited={favorited} onClick={this.favoriteTweet}>
          <Icon icon="heart" /> Favorite • {twitterData.favorite_count || 0}
        </Count>

        <ModalTrigger
          title="Twitter quote"
          trigger={
            <Count>
              <Icon icon="rightquote" /> Quote • {twitterData.quote_count || 0}
            </Count>
          }
          content={props => (
            <ModalAction
              type="quote"
              integrationId={integrationId}
              tweet={tweet}
              parentMessage={message}
              {...props}
            />
          )}
        />
      </Counts>
    );
  }

  renderReply(twitterData: ITwitterData, inReplyStatus: boolean) {
    if (inReplyStatus) {
      return null;
    }

    return (
      <Reply>
        Replying to {this.renderUserLink(twitterData.in_reply_to_screen_name)}
      </Reply>
    );
  }

  getTweetContent(extendedTweet: any, message: IMessage) {
    if (extendedTweet) {
      return extendedTweet.full_text;
    }

    return message.content;
  }

  getEntities(extendedTweet: any, twitterData: ITwitterData) {
    if (extendedTweet) {
      return extendedTweet.entities;
    }

    return twitterData.entities;
  }

  render() {
    const { message, scrollBottom } = this.props;

    // customer
    const customer = message.customer;
    const twitterCustomer = customer && customer.twitterData;
    const twitterName = twitterCustomer && twitterCustomer.name;
    const twitterUsername = twitterCustomer && twitterCustomer.screen_name;

    // twitter data
    const twitterData = message.twitterData;

    if (!twitterData) return null;

    const extendedTweet = twitterData.extended_tweet;
    const tweetContent = this.getTweetContent(extendedTweet, message);
    const entities = this.getEntities(extendedTweet, twitterData);
    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;

    return (
      <Tweet root={inReplyStatus}>
        <NameCard.Avatar customer={customer} />

        <User root={inReplyStatus}>
          {this.renderUserLink(twitterUsername, twitterName, customer)}
          {twitterUsername && <span>@{twitterUsername}</span>}
          {this.renderTweetLink()}
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

export default TwitterMessage;
