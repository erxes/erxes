import React from 'react';
import { useSearchParam } from '../../hooks';
import CategoriesFilter from './CategoriesFilter';

const PostsList: React.FC = () => {
  const [state, setState] = useSearchParam('state');
  const [
    categoryIncludeDescendants,
    setCategoryIncludeDescendants
  ] = useSearchParam('categoryIncludeDescendants');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'fit-content(20%) 1fr'
      }}
    >
      <CategoriesFilter />
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <label>
              All{' '}
              <input
                type="radio"
                name="state"
                value=""
                onChange={e => setState(e.target.value)}
                checked={!state}
              />
            </label>
            <br />
            <label>
              Draft{' '}
              <input
                type="radio"
                name="state"
                value="DRAFT"
                onChange={e => setState(e.target.value)}
                checked={state === 'DRAFT'}
              />
            </label>
            <br />
            <label>
              Published{' '}
              <input
                type="radio"
                name="state"
                value="PUBLISHED"
                onChange={e => setState(e.target.value)}
                checked={state === 'PUBLISHED'}
              />
            </label>
          </div>
          <div>
            <label>
              Show all descendant category posts
              <input
                type="checkbox"
                name="categoryIncludeDescendants"
                checked={categoryIncludeDescendants === 'true'}
                onChange={() =>
                  setCategoryIncludeDescendants(
                    categoryIncludeDescendants === 'true' ? null : 'true'
                  )
                }
              />
            </label>
          </div>
        </div>
        <h3>posts</h3>
      </div>
    </div>
  );
};

export default PostsList;
