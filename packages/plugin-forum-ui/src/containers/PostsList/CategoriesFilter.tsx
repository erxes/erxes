import React from 'react';
import { useQuery } from 'react-apollo';
import CategoryFilterItem from './CategoryFilterItem';
import { CATEGORIES_BY_PARENT_IDS } from '../../graphql/queries';
import { useSearchParam } from '../../hooks';

export default function CategoriesFilter() {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [null] }
  });
  const [_categoryId, setCategoryId] = useSearchParam('categoryId');

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const forumCategories = data.forumCategories || [];

  return (
    <nav style={{ padding: '1em 2em' }}>
      <ol style={{ listStyle: 'none' }}>
        <li key="postcategoryall" style={{ margin: '5px 0' }}>
          <a onClick={() => setCategoryId(null)} style={{ cursor: 'pointer' }}>
            All
          </a>
        </li>
        {forumCategories.map(category => (
          <li key={category._id} style={{ margin: '5px 0' }}>
            <CategoryFilterItem category={category} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
