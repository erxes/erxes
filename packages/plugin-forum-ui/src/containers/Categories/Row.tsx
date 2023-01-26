import React from 'react';
import Row from '../../components/categories/Row';
import { useQuery, useMutation } from 'react-apollo';
import { Alert, confirm } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';

export default function CategoryNavItem({ category }) {
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
            // allCategoryQueries.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const getRefetchQueries = (_id: string) => {
    return [
      {
        query: gql(queries.categoriesByParentIds),
        variables: { _id }
      }
    ];
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.updateCategory : mutations.createCategory}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(object._id)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a category`}
      />
    );
  };

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const subCategories = data.forumCategories || [];

  return (
    <>
      <Row
        parentCategory={category}
        onDelete={onDeleteCat}
        categories={subCategories}
        renderButton={renderButton}
      />
    </>
  );
}
