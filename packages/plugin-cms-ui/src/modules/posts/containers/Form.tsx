import { useQuery, useMutation } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { getGqlString } from '@erxes/ui/src/utils/core';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import PostForm from '../components/Form';
import { mutations, queries } from '../graphql';

import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  clientPortalId: string;
  postId?: string;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientPortalId } = props; // Destructure 'cpid' from the params

  React.useEffect(() => {}, [clientPortalId]);
  const { data, loading } = useQuery(queries.POST, {
    variables: {
      _id: props.postId,
    },
    fetchPolicy: 'network-only',
    skip: !props.postId,
  });

  const [addMutation] = useMutation(mutations.POST_ADD);

  const [editMutation] = useMutation(mutations.POST_EDIT);

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const input = {
      ...values,
      clientPortalId,
    };

    const variables: any = {
      input,
    };

    if (props.postId) {
      variables._id = props.postId;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.postId ? mutations.POST_EDIT : mutations.POST_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type='submit'
        icon='check-circle'
        successMessage={`You successfully ${
          props.postId ? 'updated' : 'added'
        } a post`}
      />
    );
  };

  if (loading) {
    return <Spinner />;
  }

  const post = props.postId ? data.post : null;

  const onSubmit = (doc: any) => {
    if (props.postId) {
      editMutation({
        variables: {
          _id: props.postId,
          input: doc,
        },
      }).then(() => {
        Alert.success('You successfully edited a post');
      });
    } else {
      addMutation({
        variables: {
          input: doc,
        },
      }).then((data) => {
        Alert.success('You successfully added a post', 1500);
        const postId = data.data.postAdd._id;
        setTimeout(() => {
          navigate(`${location.pathname}/${postId}`, { replace: true });
        }, 1500);
      });
    }
  };

  const updatedProps = {
    ...props,
    clientPortalId,
    post,
    onSubmit,
  };

  return <PostForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: queries.POST_LIST,
    },
  ];
};

export default FormContainer;
