import React from 'react';
import { FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import { CommentForm as Comment } from '../../styles';

const CommentForm: React.FC<{
  replyToId?: string;
  postId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
}> = ({ replyToId, postId, renderButton }) => {
  const generateDoc = (values: { content: string }) => {
    const finalValues = values;

    return {
      postId,
      replyToId,
      content: finalValues.content
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    return (
      <Comment isReply={replyToId ? true : false}>
        <FormControl
          {...formProps}
          defaultValue={''}
          placeholder="Write a comment"
          name="content"
        />
        &nbsp;&nbsp;&nbsp;
        {renderButton({
          values: generateDoc(values),
          isSubmitted
        })}
      </Comment>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CommentForm;
