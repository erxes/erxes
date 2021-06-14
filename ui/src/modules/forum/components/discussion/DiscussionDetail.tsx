import React from 'react';

import Form from 'modules/common/components/form/Form';
import dayjs from 'dayjs';
import { getUserAvatar } from 'modules/common/utils';

import {
  CommentWrapper,
  DiscussionComment,
  CommentContent,
  CreatedUser
} from './styles';

import { IDiscussion } from '../../types';

type Props = {
  discussion: IDiscussion;
};

class DiscussionDetail extends React.Component<Props> {
  renderContent = () => {
    const { discussion } = this.props;
    const { comments } = discussion;

    return (
      <CommentWrapper>
        {comments.map((comment, index) => {
          const { createdUser, createdCustomer } = comment;

          return (
            <DiscussionComment key={index}>
              <CreatedUser>
                <img
                  src={
                    createdUser
                      ? getUserAvatar(createdUser)
                      : createdCustomer.avatar
                  }
                  alt="profile"
                />
                <div>
                  <CommentContent>
                    <h5>
                      {createdUser
                        ? createdUser.username
                        : createdCustomer.firstName}
                    </h5>
                    <div
                      className="comment"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </CommentContent>
                  <span>
                    Reported{' '}
                    {dayjs(comment.createdDate).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
                <div className="actions">
                  <span>Delete</span>
                </div>
              </CreatedUser>
            </DiscussionComment>
          );
        })}
      </CommentWrapper>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default DiscussionDetail;
