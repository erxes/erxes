import { useMutation, useQuery } from '@apollo/client';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import PostForm from '../components/detail/Form';
import { mutations, queries } from '../graphql';

import Alert from '@erxes/ui/src/utils/Alert';
import { useNavigate, useParams } from 'react-router-dom';
import { WEB_DETAIL } from '../../web/queries';
import { IPostTranslation } from '../../../types';

type Props = {
  id?: string;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const navigate = useNavigate();

  const { cpId = '' } = useParams<{ cpId: string }>();

  const postId = props.id;

  const { data, loading } = useQuery(queries.POST, {
    variables: {
      id: postId,
    },
    fetchPolicy: 'network-only',
    skip: !postId,
  });

  const { data: translationsData, loading: translationsLoading } = useQuery(
    queries.POST_TRANSLATIONS,
    {
      variables: {
        postId: postId,
      },
      fetchPolicy: 'network-only',
      skip: !postId,
    }
  );

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  const [addMutation] = useMutation(mutations.POST_ADD);

  const [editMutation] = useMutation(mutations.POST_EDIT);

  const [addTranslationMutation] = useMutation(mutations.ADD_TRANSLATION);

  const [editTranslationMutation] = useMutation(mutations.EDIT_TRANSLATION);

  if (loading) {
    return <Spinner />;
  }

  const post = postId ? data.cmsPost : null;

  const onSubmit = (doc: any, translations?: IPostTranslation[]) => {
    if (postId) {
      editMutation({
        variables: {
          id: postId,
          input: doc,
        },
      }).then((res: any) => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            const variables = {
              input: {
                content: translation.content,
                customFieldsData: translation.customFieldsData,
                excerpt: translation.excerpt,
                language: translation.language,
                postId,
                title: translation.title,
              },
            };
            editTranslationMutation({
              variables
            });
          });
        }
        Alert.success('You successfully edited a post', 1500);

        setTimeout(() => {
          navigate(`/cms/website/${cpId}/posts`, {
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
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            addTranslationMutation({
              variables: {
                input: { ...translation, postId: res.data.cmsPostsAdd._id },
              },
            });
          });
        }
        Alert.success('You successfully added a post', 1500);

        setTimeout(() => {
          navigate(`/cms/website/${cpId}/posts`, {
            replace: true,
          });
        }, 1500);
      });
    }
  };

  const updatedProps = {
    ...props,
    clientPortalId: cpId,
    website: webData?.clientPortalGetConfig,
    post,
    translations: translationsData?.cmsPostTranslations || [],
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
