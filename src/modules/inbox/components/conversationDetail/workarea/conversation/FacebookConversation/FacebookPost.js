import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NameCard } from 'modules/common/components';
import { FacebookContent, Reactions, Date, UserName } from './';
import { PostContainer, User, Counts, FlexItem } from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  scrollBottom: PropTypes.func
};

export default class FacebookPost extends Component {
  renderCounts(data) {
    return (
      <Counts>
        <FlexItem>
          {data.reactions && <Reactions reactions={data.reactions} />}
          <a>{data.likeCount !== 0 && data.likeCount}</a>
        </FlexItem>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  render() {
    const { message, scrollBottom } = this.props;
    const customer = message.customer || {};
    const data = message.facebookData || {};

    return (
      <PostContainer>
        <NameCard.Avatar customer={customer} />

        <User isPost>
          <UserName username={data.senderName} userId={data.senderId} />
          <Date message={message} />
        </User>

        <FacebookContent
          content={message.content}
          image={data.photo}
          images={data.photos}
          link={data.link || data.video}
          scrollBottom={scrollBottom}
        />

        {this.renderCounts(data)}
      </PostContainer>
    );
  }
}

FacebookPost.propTypes = propTypes;
