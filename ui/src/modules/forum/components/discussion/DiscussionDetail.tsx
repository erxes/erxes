import React from 'react';
import Form from 'modules/common/components/form/Form';
import dayjs from 'dayjs';
import { getUserAvatar } from 'modules/common/utils';
import NameCard from 'modules/common/components/nameCard/NameCard';
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
                {createdUser ? (
                  <img src={getUserAvatar(createdUser)} alt="profile" />
                ) : (
                  <NameCard.Avatar customer={createdCustomer} size={30} />
                )}
                <div>
                  <CommentContent>
                    <h5>
                      {createdUser
                        ? `${createdUser.details &&
                            createdUser.details.fullName}`
                        : `${createdCustomer &&
                            createdCustomer.firstName} ${createdCustomer &&
                            createdCustomer.lastName}`}
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
