import * as React from 'react';

import NameCard from 'modules/common/components/nameCard/NameCard';
import { ICustomer } from 'modules/customers/types';
import { IFacebookPost } from 'modules/inbox/types';
import Date from './Date';
import FacebookContent from './FacebookContent';
import { Counts, PostContainer, User } from './styles';
import UserName from './UserName';

type Props = {
  post: IFacebookPost;
  customer: ICustomer;
  scrollBottom: () => void;
};

export default class FacebookPost extends React.Component<Props, {}> {
  renderCounts(commentCount: number) {
    return (
      <Counts>
        <span>{commentCount} Comments</span>
      </Counts>
    );
  }

  render() {
    const { post, customer, scrollBottom } = this.props;

    if (!post) {
      return null;
    }

    return (
      <PostContainer>
        <NameCard.Avatar customer={customer} />

        <User isPost={true}>
          <UserName
            username={`${customer.firstName} ${customer.lastName || ''}`}
            userId={post.senderId}
          />
          <Date type="post" timestamp={post.timestamp} />
        </User>

        <FacebookContent
          content={post.content}
          attachments={post.attachments}
          scrollBottom={scrollBottom}
        />

        {this.renderCounts(post.commentCount)}
      </PostContainer>
    );
  }
}
