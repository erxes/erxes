import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { useQuery } from '@apollo/client';
import { getGqlString } from '@erxes/ui/src/utils/core';

import PostForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useParams } from 'react-router-dom';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  postId?: string;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const { cpId: clientPortalId } = useParams(); // Destructure 'cpid' from the params

  React.useEffect(() => {
    if (clientPortalId) {
      console.log('Client Portal ID:', clientPortalId);
    }
  }, [clientPortalId]);
  const {data, loading} = useQuery(queries.POST, {
    variables: {
      _id: props.postId
    },
    fetchPolicy: 'network-only',
    skip: !props.postId
  })

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const input = {
      ...values,
      clientPortalId
    };

    const variables :any= {
      input
    }

    if (props.postId) {
      variables._id = props.postId;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.postId ? mutations.CATEGORY_EDIT : mutations.CATEGORY_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          props.postId ? 'updated' : 'added'
        } a post`}
      />
    );
  };

  if (loading) {
    return <Spinner/>
  }

  const post = props.postId ? data.post : null

  const updatedProps = {
    ...props,
    post,
    renderButton
  };

  return <PostForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: queries.POST_LIST
    }
  ];
};

export default FormContainer;
