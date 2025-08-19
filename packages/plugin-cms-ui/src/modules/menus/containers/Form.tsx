import React from 'react';

import { useMutation, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';
import { removeTypename } from '@erxes/ui/src/utils/core';
import { IPostTranslation } from '../../../types';
import {
  ADD_TRANSLATION,
  EDIT_TRANSLATION,
  TRANSLATIONS,
} from '../../commonQueries';
import MenuForm from '../components/Form';
import { ADD_MENU, EDIT_MENU } from '../graphql/mutations';
import { IMenu } from '../types';

type Props = {
  clientPortalId: string;
  website?: any;
  menu?: IMenu;
  closeModal: () => void;
  refetch?: () => void;
};

const FormContainer = (props: Props) => {
  const { clientPortalId } = props;

  const [editMutation] = useMutation(EDIT_MENU);
  const [addMutation] = useMutation(ADD_MENU);
  const [editTranslationMutation] = useMutation(EDIT_TRANSLATION);
  const [addTranslationMutation] = useMutation(ADD_TRANSLATION);

  const { data: translationsData, loading: translationsLoading } = useQuery(
    TRANSLATIONS,
    {
      variables: {
        postId: props.menu?._id,
      },
      fetchPolicy: 'network-only',
      skip: !props.menu?._id,
    }
  );
  const onSubmit = (doc: any, translations?: IPostTranslation[]) => {
    if (props.menu?._id) {
      editMutation({
        variables: {
          _id: props.menu._id,
          input: removeTypename(doc),
        },
      }).then(() => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            const variables = {
              input: {
                content: translation.content,
                language: translation.language,
                postId: props.menu?._id,
                title: translation.title,
              },
            };
            editTranslationMutation({
              variables,
            });
          });
        }
        Alert.success('You successfully edited a menu', 1500);
        if (props.refetch) {
          props.refetch();
        }
      });
    } else {
      addMutation({
        variables: {
          input: { ...doc, clientPortalId },
        },
      }).then((res: any) => {
        if (translations && translations.length > 0) {
          translations.forEach((translation) => {
            addTranslationMutation({
              variables: {
                input: {
                  ...translation,
                  postId: res.data.cmsAddMenu._id,
                },
              },
            });
          });
        }
        Alert.success('You successfully added a menu', 1500);
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

  return <MenuForm {...updatedProps} />;
};

export default FormContainer;
