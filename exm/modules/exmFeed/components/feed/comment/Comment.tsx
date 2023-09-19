import { ActionBar, CommentContainer, Reply } from '../../../styles';
import React, { useState } from 'react';

import ActionButtons from '../../../../common/ActionButtons';
import Button from '../../../../common/Button';
import CommentForm from './CommentForm';
import { IButtonMutateProps } from '../../../../common/types';
import { IComment } from '../../../../types';
import NameCard from '../../../../common/nameCard/NameCard';
import Tip from '../../../../common/Tip';
import { __ } from '../../../../../utils';

const Comment: React.FC<{
  comment: IComment;
  onDelete: (item: IComment) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  replies?: IComment[];
}> = ({ comment, onDelete, renderButton, replies }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const renderCancelButton = () => {
    if (showReplyForm) {
      return (
        <Tip text={__('Cancel')} placement="top">
          <Button
            id="commentDelete"
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
          parentId={comment._id}
          contentId={comment.contentId}
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
        <NameCard user={comment.createdUser} singleLine={false} secondLine={comment.createdUser.details.position} />
        <ActionButtons>
          {renderCancelButton()}
          <Tip text={__('Reply')} placement="top">
            <Button
              id="commentReply"
              btnStyle="link"
              onClick={() => setShowReplyForm(true)}
              icon="reply"
            />
          </Tip>
          <Tip text={__('Delete')} placement="top">
            <Button
              id="commentDelete"
              btnStyle="link"
              onClick={() => onDelete(comment)}
              icon="trash-alt"
            />
          </Tip>
        </ActionButtons>
      </ActionBar>
      <p>{comment.comment}</p>
      <Reply>
        {renderForm()}
        {renderReplies()}
      </Reply>
    </CommentContainer>
  );
};

export default Comment;
