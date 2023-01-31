import React, { useState } from 'react';
import CommentForm from '../../components/comment/CommentForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CommentContainer, ActionBar } from '../../styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';

const Comment: React.FC<{
  comment: any;
  onDelete?: (string) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  replies?: any;
}> = ({ comment, onDelete, renderButton, replies }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <CommentContainer>
      <ActionBar>
        <NameCard user={comment.createdBy || comment.createdByCp} />
        <ActionButtons>
          {showReplyForm && (
            <Tip text={__('Cancel')} placement="top">
              <Button
                id="pageDelete"
                btnStyle="link"
                onClick={() => setShowReplyForm(false)}
                icon="times-circle"
              />
            </Tip>
          )}
          <Tip text={__('Reply')} placement="top">
            <Button
              id="pageDelete"
              btnStyle="link"
              onClick={() => setShowReplyForm(true)}
              icon="reply"
            />
          </Tip>
          <Tip text={__('Delete')} placement="top">
            <Button
              id="pageDelete"
              btnStyle="link"
              onClick={() => onDelete(comment)}
              icon="trash-alt"
            />
          </Tip>
        </ActionButtons>
      </ActionBar>
      <p>{comment.content}</p>
      <span>
        Up votes <b>{comment.upVoteCount}</b> Down votes{' '}
        <b>{comment.downVoteCount}</b>
      </span>
      <div style={{ marginLeft: 40 }}>
        {showReplyForm && (
          <CommentForm
            renderButton={renderButton}
            key={'form' + comment._id}
            replyToId={comment._id}
            postId={comment.postId}
          />
        )}

        {replies &&
          replies.map(r => (
            <Comment
              comment={r}
              key={r._id}
              onDelete={() => onDelete(r)}
              renderButton={renderButton}
            />
          ))}
      </div>
    </CommentContainer>
  );
};

export default Comment;
