import React, { useState } from 'react';
import { FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import { CommentForm as Comment } from '../../styles';

const CommentForm: React.FC<{
  replyToId?: string;
  postId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
}> = ({ replyToId, postId, renderButton }) => {
  const [comment, setComment] = useState('');
  const generateDoc = (values: { comment: string }) => {
    const finalValues = values;

    return {
      postId,
      replyToId,
      content: finalValues.comment
    };
  };

  const handleChange = e => {
    e.preventDefault();

    setComment(e.target.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    return (
      <Comment isReply={replyToId ? true : false}>
        <FormControl
          {...formProps}
          placeholder="Write a comment"
          name="comment"
          value={comment}
          onChange={handleChange}
        />
        &nbsp;&nbsp;&nbsp;
        {renderButton({
          values: generateDoc(values),
          isSubmitted,
          callback: () => setComment('')
        })}
      </Comment>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CommentForm;
