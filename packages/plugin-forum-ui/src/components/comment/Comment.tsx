import React, { useState } from 'react';
import CommentForm from '../../components/comment/CommentForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CommentContainer, ActionBar, Reply } from '../../styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { IComment } from '../../types';

const Comment: React.FC<{
  comment: IComment;
  onDelete?: (string) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  replies?: IComment[];
}> = ({ comment, onDelete, renderButton, replies }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const renderCancelButton = () => {
    if (showReplyForm) {
      return (
        <Tip text={__('Cancel')} placement="top">
          <Button
            id="pageDelete"
            btnStyle="link"
            onClick={() => setShowReplyForm(false)}
            icon="times-circle"
          />
        </Tip>
      );
    }

    return null;
  };

  const renderForm = () => {
    if (showReplyForm) {
      return (
        <CommentForm
          renderButton={renderButton}
          key={'form' + comment._id}
          replyToId={comment._id}
          postId={comment.postId}
        />
      );
    }

    return null;
  };

  const renderReplies = () => {
    if (replies) {
      return replies.map(r => (
        <Comment
          comment={r}
          key={r._id}
          onDelete={() => onDelete(r)}
          renderButton={renderButton}
        />
      ));
    }

    return null;
  };

  return (
    <CommentContainer>
      <ActionBar>
        <NameCard user={comment.createdBy || comment.createdByCp} />
        <ActionButtons>
          {renderCancelButton()}
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
      <Reply>
        {renderForm()}
        {renderReplies()}
      </Reply>
    </CommentContainer>
  );
};

export default Comment;
