import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NameCard } from 'modules/common/components';
import { FacebookContent, Reactions, Date, UserName } from './';
import { PostContainer, User, Counts, FlexItem } from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  replyPost: PropTypes.func
};

class FacebookMessage extends Component {
  renderCounts(data) {
    return (
      <Counts>
        <FlexItem>
          {data.reactions && <Reactions reactions={data.reactions} />}
          <a>{data.likeCount}</a>
        </FlexItem>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  render() {
    const { message } = this.props;
    const customer = message.customer || {};
    const data = message.facebookData || {};

    return (
      <PostContainer>
        <NameCard.Avatar customer={customer} />

        <User isPost={data.isPost}>
          <UserName username={data.senderName} userId={data.senderId} />
          <Date message={message} />
        </User>

        <FacebookContent
          content={message.content}
          image={data.photo}
          images={data.photos}
          video={data.video}
        />

        {this.renderCounts(data)}
      </PostContainer>
    );
  }
}

FacebookMessage.propTypes = propTypes;

export default FacebookMessage;
