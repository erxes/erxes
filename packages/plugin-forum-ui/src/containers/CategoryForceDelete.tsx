import React from 'react';
import { FORCE_DELETE_CATEGORY } from '../graphql/mutations';
import { useMutation } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { allCategoryQueries } from '../graphql/queries';

const CategoryForceDelete: React.FC<{ _id: string }> = ({ _id }) => {
  const history = useHistory();

  const [mutation] = useMutation(FORCE_DELETE_CATEGORY, {
    variables: { id: _id },
    onError: e => alert(JSON.stringify(e, null, 2)),
    onCompleted: () => history.push('/forums/categories'),
    refetchQueries: allCategoryQueries
  });

  const onClick = () => {
    if (
      !confirm(
        'Are you sure you want to delete this category, its realted posts and all descendant categories?'
      )
    );
    mutation();
  };
  return <button onClick={onClick}>Force Delete</button>;
};

export default CategoryForceDelete;
