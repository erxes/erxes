import React from 'react';
import { useQuery } from 'react-apollo';
// import CategoryNavItem from './CategoryNavItem';
import { CATEGORIES_BY_PARENT_IDS } from '../../graphql/queries';
import { Link, useRouteMatch } from 'react-router-dom';
import LayoutCategories from '../../components/LayoutCategories';
import { useMutation } from 'react-apollo';
import { CREATE_ROOT_CATEGORY } from '../../graphql/mutations';
import { useHistory } from 'react-router-dom';
import { allCategoryQueries } from '../../graphql/queries';

export default function CategoriesNav() {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [null] }
  });

  const [mutation] = useMutation(CREATE_ROOT_CATEGORY, {
    onError: e => alert(JSON.stringify(e, null, 2)),
    refetchQueries: allCategoryQueries
  });
  const history = useHistory();

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const forumCategories = data.forumCategories || [];

  const onSubmit = async v => {
    console.log('submited');
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
    <LayoutCategories onSubmit={onSubmit} forumCategories={forumCategories} />
  );
}
