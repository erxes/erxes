import React from 'react';
import { useSearchParam } from '../../hooks';
import CategoriesFilter from './CategoriesFilter';
import List from './List';
import { Link } from 'react-router-dom';

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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={`/forums/posts/new`}>Create new post</Link>
        <CategoriesFilter />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ margin: 10, padding: 10 }}>
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
          <div style={{ margin: 10, padding: 10 }}>
            <label>
              Show all descendant categories' posts{' '}
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
        <div>
          <List />
        </div>
      </div>
    </div>
  );
};

export default PostsList;
