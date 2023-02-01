import React from 'react';
import { useQuery } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { withProps } from '@erxes/ui/src/utils';
import { IPost } from '../../types';
import PostForm from '../../components/posts/PostForm';

type Props = {
  post?: IPost;
  closeModal: () => void;
} & IRouterProps;

function PostFormContainer({ closeModal, post }: Props) {
  const { data } = useQuery(gql(queries.categoriesAll));

  const { forumCategories } = data;

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
        refetchQueries={getRefetchQueries()}
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
      categories={forumCategories}
      renderButton={renderButton}
      closeModal={closeModal}
    />
  );
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.forumPostsQuery)
    }
  ];
};

export default withProps<{}>(compose()(withRouter<Props>(PostFormContainer)));
