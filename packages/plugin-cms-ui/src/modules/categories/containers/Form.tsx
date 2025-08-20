import React from 'react';

import { useMutation, useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { IPostTranslation } from '../../../types';
import {
  ADD_TRANSLATION,
  EDIT_TRANSLATION,
  TRANSLATIONS,
} from '../../commonQueries';
import CategoryForm from '../components/Form';
import { mutations, queries } from '../graphql';
import Alert from '@erxes/ui/src/utils/Alert';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  clientPortalId: string;
  category?: any;
  website?: any;
  closeModal: () => void;
  refetch?: () => void;
};

const FormContainer = (props: Props) => {
  const [searchParams] = useSearchParams();
  const { clientPortalId } = props;
  const [editMutation] = useMutation(mutations.CATEGORY_EDIT);
  const [addMutation] = useMutation(mutations.CATEGORY_ADD);
  const [editTranslationMutation] = useMutation(EDIT_TRANSLATION);
  const [addTranslationMutation] = useMutation(ADD_TRANSLATION);

  const { data: translationsData, loading: translationsLoading } = useQuery(
    TRANSLATIONS,
    {
      variables: {
        postId: props.category?._id,
      },
      fetchPolicy: 'network-only',
      skip: !props.category?._id,
    }
  );

  const onSubmit = (doc: any, translations?: IPostTranslation[]) => {
    if (props.category?._id) {
      editMutation({
        variables: {
          _id: props.category._id,
          input: doc,
        },
      }).then(() => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            const variables = {
              input: {
                content: translation.content,
                language: translation.language,
                postId: props.category._id,
                title: translation.title,
              },
            };
            editTranslationMutation({
              variables,
            });
          });
        }
        Alert.success('You successfully edited a category', 1500);
        if (props.refetch) {
          props.refetch();
        }
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
                input: {
                  ...translation,
                  postId: res.data.cmsCategoriesAdd._id,
                },
              },
            });
          });
        }
        Alert.success('You successfully added a category', 1500);
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

  return <CategoryForm {...updatedProps} />;
};

const getRefetchQueries = (clientPortalId?: string) => {
  return [
    {
      query: queries.GET_CATEGORIES,
      variables: {
        clientPortalId,
      },
    },
  ];
};

export default FormContainer;
