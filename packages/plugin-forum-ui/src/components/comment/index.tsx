import React from 'react';
import CommentForm from '../../components/comment/CommentForm';
import Comment from './Comment';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CommentSection } from '../../styles';

const CommentComponent: React.FC<{
  postId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  error?: any;
  loading?: boolean;
  data: any;
  refetch: () => void;
}> = ({ postId, renderButton, error, loading, data, refetch }) => {
  return (
    <CommentSection>
      <CommentForm key={postId} postId={postId} renderButton={renderButton} />
      {error && <pre>Error occured</pre>}
      {!loading &&
        !error &&
        (data.forumComments || []).map(c => (
          <Comment
            renderButton={renderButton}
            key={c._id}
            comment={c}
            onDelete={refetch}
          />
        ))}
    </CommentSection>
  );
};

export default CommentComponent;
