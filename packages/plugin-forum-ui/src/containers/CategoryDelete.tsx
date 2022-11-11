import React from 'react';
import { useMutation } from 'react-apollo';
import { DELETE_CATEGORY } from '../graphql/mutations';
import { useHistory } from 'react-router-dom';
import { allCategoryQueries } from '../graphql/queries';

const CategoryDelete: React.FC<{ _id: string; onDelete?: () => any }> = ({
  _id,
  onDelete
}) => {
  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY, {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: allCategoryQueries
  });

  const onClickDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategoryMutation({
        variables: { id: _id },
        refetchQueries: allCategoryQueries
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
