import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import CategoryForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { TRANSLATIONS } from '../../commonQueries';
import { IPostTranslation } from '../../../types';

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

  // const renderButton = ({
  //   values,
  //   isSubmitted,
  //   callback,
  //   object,
  // }: IButtonMutateProps) => {
  //   const input = {
  //     ...values,
  //     clientPortalId,
  //   };

  //   const variables: any = {
  //     input,
  //   };

  //   if (props.category) {
  //     variables._id = props.category._id;
  //   }

  //   return (
  //     <ButtonMutate
  //       mutation={getGqlString(
  //         props.category ? mutations.CATEGORY_EDIT : mutations.CATEGORY_ADD
  //       )}
  //       variables={variables}
  //       callback={callback}
  //       refetchQueries={getRefetchQueries(clientPortalId)}
  //       isSubmitted={isSubmitted}
  //       type='submit'
  //       icon='check-circle'
  //       successMessage={`You successfully ${
  //         props.category ? 'updated' : 'added'
  //       } a category`}
  //     />
  //   );
  // };

  const onSubmit = (doc: any, translations?: IPostTranslation[]) => {
    
  }

  const updatedProps = {
    ...props,
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
