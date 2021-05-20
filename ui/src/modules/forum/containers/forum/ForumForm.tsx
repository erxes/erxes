import React from 'react';
import { ForumForm } from '../../components/forum';

const ForumFormContainer = props => {
  const updatedProps = {
    ...props
  };
  return <ForumForm {...updatedProps} />;
};

export default ForumFormContainer;
