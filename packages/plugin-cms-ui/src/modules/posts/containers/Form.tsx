import { useQuery, useMutation } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { getGqlString } from '@erxes/ui/src/utils/core';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import PostForm from '../components/Form';
import { mutations, queries } from '../graphql';

import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  id?: string;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  let clientPortalId = searchParams.get('web') || '';
  const postId = props.id;

  const { data, loading } = useQuery(queries.POST, {
    variables: {
      id: postId,
    },
    fetchPolicy: 'network-only',
    skip: !postId,
  });

  const [addMutation] = useMutation(mutations.POST_ADD);

  const [editMutation] = useMutation(mutations.POST_EDIT);

  if (loading) {
    return <Spinner />;
  }

  const post = postId ? data.cmsPost : null;
  if (post?.clientPortalId) {
    clientPortalId = post.clientPortalId;
  }

  const onSubmit = (doc: any) => {
    if (postId) {
      editMutation({
        variables: {
          id: postId,
          input: doc,
        },
      }).then(() => {
        Alert.success('You successfully edited a post', 1500);
        
        setTimeout(() => {
          
          navigate(`/cms/posts?web=${clientPortalId}`, {
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
        
        const postId = res.data.postsAdd._id;
        Alert.success('You successfully added a post', 1500);

        setTimeout(() => {
          navigate(`/cms/posts?web=${clientPortalId}`, {
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
