import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import LayoutCategories from '../../components/LayoutCategories';
import { mutations, queries } from '../../graphql';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

export default function CategoriesNav() {
  const { data, loading, error } = useQuery(
    gql(queries.categoriesByParentIds),
    {
      variables: { parentId: [null] }
    }
  );

  const getRefetchQueries = () => {
    return [
      {
        query: gql(queries.categoriesByParentIds),
        variables: { parentId: [null] }
      }
    ];
  };

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const forumCategories = data.forumCategories || [];

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object._id ? mutations.updateCategory : mutations.createCategory
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object._id ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  return (
    <LayoutCategories
      renderButton={renderButton}
      forumCategories={forumCategories}
    />
  );
}
