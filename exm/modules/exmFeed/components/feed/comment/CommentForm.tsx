import React, { useState } from 'react';
import { FormControl } from '../../../../common/form';
import { IButtonMutateProps, IFormProps } from '../../../../common/types';
import Form from '../../../../common/form/Form';
import { CommentForm as Comment } from '../../../styles';

const CommentForm: React.FC<{
  parentId?: string;
  contentId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
}> = ({ parentId, contentId, renderButton }) => {
  const [comment, setComment] = useState('');
  const generateDoc = (values: { comment: string }) => {
    const finalValues = values;

    return {
      contentId,
      parentId,
      comment: finalValues.comment,
      contentType: 'exmFeed'
    };
  };

  const handleChange = e => {
    e.preventDefault();

    setComment(e.target.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    return (
      <Comment isReply={parentId ? true : false}>
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
