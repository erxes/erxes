import React from 'react';
import ForumForm from '../../components/forums/ForumForm';
import { IForum } from '../../types';
import { IButtonMutateProps } from 'modules/common/types';

type Props = {
  forum: IForum;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  remove: (forumId: string, callback?: () => void) => void;
};

const ForumFormContainer = ({ remove, forum, ...props }: Props) => {
  const updatedProps = {
    ...props,
    forum,
    remove
  };

  return <ForumForm {...updatedProps} />;
};

export default ForumFormContainer;
