import React from 'react';

import { useMutation, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';
import { useSearchParams } from 'react-router-dom';
import { IPostTranslation } from '../../../types';
import {
  ADD_TRANSLATION,
  EDIT_TRANSLATION,
  TRANSLATIONS,
} from '../../commonQueries';
import TagForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { removeTypename } from '@erxes/ui/src/utils/core';

type Props = {
  clientPortalId: string;
  website?: any;
  tag?: any;
  closeModal: () => void;
  refetch?: () => void;
};

const FormContainer = (props: Props) => {
  const [searchParams] = useSearchParams();
  const { clientPortalId } = props;
  const [editMutation] = useMutation(mutations.TAG_EDIT);
  const [addMutation] = useMutation(mutations.TAG_ADD);
  const [editTranslationMutation] = useMutation(EDIT_TRANSLATION);
  const [addTranslationMutation] = useMutation(ADD_TRANSLATION);

  const { data: translationsData, loading: translationsLoading } = useQuery(
    TRANSLATIONS,
    {
      variables: {
        postId: props.tag?._id,
      },
      fetchPolicy: 'network-only',
      skip: !props.tag?._id,
    }
  );
  const onSubmit = (doc: any, translations?: IPostTranslation[]) => {
    if (props.tag?._id) {
      editMutation({
        variables: {
          _id: props.tag._id,
          input: removeTypename(doc),
        },
      }).then(() => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            const variables = {
              input: {
                content: translation.content,
                language: translation.language,
                postId: props.tag._id,
                title: translation.title,
              },
            };
            editTranslationMutation({
              variables,
            });
          });
        }
        Alert.success('You successfully edited a tag', 1500);
        if (props.refetch) {
          props.refetch();
        }
      });
    } else {
      addMutation({
        variables: {
          input: {...doc, clientPortalId},
        },
      }).then((res: any) => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            addTranslationMutation({
              variables: {
                input: {
                  ...translation,
                  postId: res.data.cmsTagsAdd._id,
                },
              },
            });
          });
        }
        Alert.success('You successfully added a tag', 1500);
        if (props.refetch) {
          props.refetch();
        }
      });
    }
    props.closeModal();

  };

  if (translationsLoading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    onSubmit,
    translations: translationsData?.cmsPostTranslations || [],
  };

  return <TagForm {...updatedProps} />;
};

const getRefetchQueries = (clientPortalId?: string) => {
  return [
    {
      query: queries.GET_TAGS,
      variables: {
        clientPortalId,
      },
    },
  ];
};

export default FormContainer;
