import React, { useState } from 'react';
import CategoryParentSelect from './CategoryParentSelect';

const CategoryDelete: React.FC<{ _id: string }> = ({ _id }) => {
  const [adopterCategoryId, setAdopterCategoryId] = useState('');

  const onDelete = () => {
    if (!adopterCategoryId) {
      return alert(
        'Please choose category to transfer all of its subcategories and posts'
      );
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

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
      </form>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
};

export default CategoryDelete;
