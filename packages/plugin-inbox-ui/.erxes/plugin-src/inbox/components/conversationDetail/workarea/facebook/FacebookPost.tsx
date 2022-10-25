import * as React from 'react';

import { Counts, User } from './styles';

import Date from './Date';
import FacebookContent from './FacebookContent';
import { FormControl } from '@erxes/ui/src/components/form';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IFacebookPost } from '@erxes/ui-inbox/src/inbox/types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { PostContainer } from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/facebook/styles';
import UserName from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/facebook/UserName';

type Props = {
  post: IFacebookPost;
  commentCount: number;
  customer: ICustomer;
  scrollBottom: () => void;
  onToggleClick: () => void;
  isResolved: boolean;
};

export default class FacebookPost extends React.Component<Props, {}> {
  renderCounts(commentCount: number) {
    return (
      <Counts>
        <span>{commentCount} Comments</span>

        <FormControl
          componentClass="checkbox"
          onChange={this.props.onToggleClick}
          checked={this.props.isResolved}
        >
          Show resolved comments
        </FormControl>
      </Counts>
    );
  }

  render() {
    const { post, customer, scrollBottom, commentCount } = this.props;

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
          <span>
            <Date
              type="post"
              timestamp={post.timestamp}
              permalink_url={post.permalink_url}
            />
          </span>
        </User>

        <FacebookContent
          content={post.content}
          attachments={post.attachments}
          scrollBottom={scrollBottom}
        />
        <div>{this.renderCounts(commentCount)}</div>
      </PostContainer>
    );
  }
}
