import React from 'react';
import { CATEGORIES_BY_PARENT_IDS } from '../../graphql/queries';
import Row from '../../components/categories/Row';
import { useQuery, useMutation } from 'react-apollo';
import { allCategoryQueries } from '../../graphql/queries';
import {
  UPDATE_CATEGORY,
  CREATE_CATEGORY,
  DELETE_CATEGORY
} from '../../graphql/mutations';
import { Alert, confirm } from '@erxes/ui/src/utils';

export default function CategoryNavItem({ category }) {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [category._id] }
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    // onCompleted: () => alert('updated'),
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: allCategoryQueries
  });

  const [addSubCategory] = useMutation(CREATE_CATEGORY, {
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: allCategoryQueries
  });

  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY, {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: allCategoryQueries
  });

  const onDeleteCat = () => {
    confirm(`Are you sure?`)
      .then(() => {
        deleteCategoryMutation({
          variables: { id: category._id },
          refetchQueries: allCategoryQueries
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

  const onSubmitUpdate = v => {
    updateCategory({
      variables: {
        ...v,
        id: category._id
      }
    });
  };

  const onAddSubCategory = v => {
    addSubCategory({
      variables: {
        ...v,
        parentId: category._id
      }
    });
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
        onAddSubCategory={onAddSubCategory}
        onSubmitUpdate={onSubmitUpdate}
        onDelete={onDeleteCat}
        categories={subCategories}
      />
    </>
  );
}
