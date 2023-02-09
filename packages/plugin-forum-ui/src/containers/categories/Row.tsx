import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations, queries } from '../../graphql';
import { useMutation, useQuery } from 'react-apollo';

import { ICategory } from '../../types';
import React from 'react';
import Row from '../../components/categories/Row';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';

type Props = {
  category: ICategory;
};

export default function RowContainer({ category }: Props) {
  const { data, loading, error } = useQuery(
    gql(queries.categoriesByParentIds),
    {
      variables: { parentId: [category._id] }
    }
  );

  const [deleteCategoryMutation] = useMutation(gql(mutations.deleteCategory), {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: queries.allCategoryQueries
  });

  const onDeleteCat = () => {
    confirm(`Are you sure?`)
      .then(() => {
        deleteCategoryMutation({
          variables: { id: category._id },
          refetchQueries: queries.allCategoryQueries
        })
          .then(() => {
            Alert.success('You successfully deleted a category');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const subCategories = data.forumCategories || [];

  return (
    <Row
      parentCategory={category}
      onDelete={onDeleteCat}
      categories={subCategories}
    />
  );
}
