import React from 'react';
import CommentForm from './CommentForm';
import Comment from '../../../containers/feed/comment/Comment';
import { IButtonMutateProps } from '../../../../common/types';
import { Alert } from '../../../../utils';

const CommentComponent: React.FC<{
  contentId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  error?: any;
  loading?: boolean;
  data: any;
  refetch: () => void;
}> = ({ contentId, renderButton, error, loading, data, refetch }) => {
  const renderError = () => {
    if (error) {
      Alert.error(error.message);
    }

    return null;
  };

  const renderComment = () => {
    if (!loading && !error) {
      return (data.comments.list || []).map(c => (
        <Comment
          comment={c}
          renderButton={renderButton}
          key={c._id}
          onDeleted={refetch}
        />
      ));
    }

    return null;
  };
  return (
    <>
      {renderError()}
      {renderComment()}
      <CommentForm key={contentId} contentId={contentId} renderButton={renderButton} />
    </>
  );
};

export default CommentComponent;
