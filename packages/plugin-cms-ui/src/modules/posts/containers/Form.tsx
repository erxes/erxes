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
      id: props.postId,
    },
    fetchPolicy: 'network-only',
    skip: !props.postId,
  });

  const [addMutation] = useMutation(mutations.POST_ADD);

  const [editMutation] = useMutation(mutations.POST_EDIT);

  if (loading) {
    return <Spinner />;
  }

  const post = props.postId ? data.post : null;

  const onSubmit = (doc: any) => {
    if (props.postId) {
      editMutation({
        variables: {
          id: props.postId,
          input: doc,
        },
      }).then(() => {
        Alert.success('You successfully edited a post', 1500);
        console.log('success');
        setTimeout(() => {  
          console.log('navigate');
          navigate(`/cms/posts/${clientPortalId}`, {
            replace: true,
          });
        }, 1500);
      });
    } else {
      addMutation({
        variables: {
          input: doc,
        },
      }).then((res: any) => {
        console.log('res', res);
        const postId = res.data.postsAdd._id;
        Alert.success('You successfully added a post', 1500);

        setTimeout(() => {
          navigate(`/cms/posts/${clientPortalId}/edit/${postId}`, {
            replace: true,
          });
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
