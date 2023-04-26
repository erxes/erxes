import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IPost } from '../../types';
import PostForm from '../../components/posts/PostForm';
import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

type Props = {
  post?: IPost;
  closeModal: () => void;
};

function PostFormContainer({ closeModal, post }: Props) {
  const { data } = useQuery(gql(queries.categoriesAll));
  const tagsQuery = useQuery(gql(queries.tags));

  const { forumCategories } = data;
  const tags = tagsQuery.data?.tags || [];

  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editPost : mutations.createPost}
        variables={values}
        callback={callback}
        refetchQueries={queries.postRefetchAfterEdit}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  return (
    <PostForm
      post={post}
      tags={tags}
      categories={forumCategories}
      renderButton={renderButton}
      closeModal={closeModal}
    />
  );
}

export default PostFormContainer;
