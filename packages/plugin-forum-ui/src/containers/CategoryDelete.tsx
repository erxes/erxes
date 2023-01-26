import React from 'react';
import { useMutation } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { mutations, queries } from '../graphql';
import gql from 'graphql-tag';

const CategoryDelete: React.FC<{ _id: string; onDelete?: () => any }> = ({
  _id,
  onDelete
}) => {
  const [deleteCategoryMutation] = useMutation(gql(mutations.deleteCategory), {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: queries.allCategoryQueries
  });

  const onClickDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategoryMutation({
        variables: { id: _id },
        refetchQueries: queries.allCategoryQueries
      });
      if (onDelete) onDelete();
    } catch (e) {}
  };

  return (
    <div>
      <form>
        <button type="button" onClick={onClickDelete}>
          Delete
        </button>
      </form>
    </div>
  );
};

export default CategoryDelete;
