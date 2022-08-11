import React, { useState } from 'react';
import CategoryParentSelect from './CategoryParentSelect';
import { useMutation } from 'react-apollo';
import { DELETE_CATEGORY } from '../graphql/mutations';
import { useHistory } from 'react-router-dom';
import { allCategoryQueries } from '../graphql/queries';

const CategoryDelete: React.FC<{ _id: string }> = ({ _id }) => {
  const [adopterCategoryId, setAdopterCategoryId] = useState('');

  const history = useHistory();

  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY, {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: allCategoryQueries
  });

  const onDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategoryMutation({
        variables: { id: _id, adopterCategoryId: adopterCategoryId || null },
        refetchQueries: allCategoryQueries
      });
      history.push(`/forums/categories/${adopterCategoryId}`);
    } catch (e) {}

    console.log({ _id, adopterCategoryId });
  };

  return (
    <div>
      <form>
        <label>
          Transfer subdirectories and posts to:
          <CategoryParentSelect
            value={adopterCategoryId}
            parentFor={_id}
            onChange={setAdopterCategoryId}
          />
        </label>
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      </form>
    </div>
  );
};

export default CategoryDelete;
