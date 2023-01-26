import React from 'react';
import CategoryForm from '../components/CategoryForm';
import { useMutation } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { mutations, queries } from '../graphql';
import gql from 'graphql-tag';

const CategoryNew: React.FC = () => {
  const [mutation] = useMutation(gql(mutations.createRootCategory), {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: queries.allCategoryQueries
  });

  const history = useHistory();

  const onSubmit = async v => {
    try {
      const {
        data: {
          forumCreateCategory: { _id }
        }
      } = await mutation({
        variables: v
      });

      history.push(`/forums/categories/${_id}`);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <h2>Create new root category</h2>
      <CategoryForm noParent={true} onSubmit={onSubmit} />
    </div>
  );
};

export default CategoryNew;
