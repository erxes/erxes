import React from 'react';
import { useSearchParam } from '../../hooks';
import { useQuery } from 'react-apollo';
import { FORUM_POSTS_COUNT, FORUM_POSTS_QUERY } from '../../graphql/queries';
import { Link } from 'react-router-dom';

const perPageOptions = [5, 10, 25, 50, 100];

const List: React.FC = () => {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const [perPage] = useSearchParam('perPage');
  const [page] = useSearchParam('page');

  const variables = {
    categoryId,
    state,
    categoryIncludeDescendants: !!categoryIncludeDescendants
  };

  const postQuery = useQuery(FORUM_POSTS_QUERY, {
    variables,
    fetchPolicy: 'network-only'
  });

  const countQuery = useQuery(FORUM_POSTS_COUNT, {
    variables,
    fetchPolicy: 'network-only'
  });

  if (postQuery.loading) return null;
  if (postQuery.error)
    return <pre>{JSON.stringify(postQuery.error, null, 2)}</pre>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h5>Total: {countQuery.data?.forumPostsCount || 0}</h5>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>State</th>
            <th>State changed at</th>
            <th>State changed by</th>
            <th>Created At</th>
            <th>Created By</th>
            <th>Updated At</th>
            <th>Updated By</th>
            <th>Comment(s) count</th>
          </tr>
        </thead>
        <tbody>
          {postQuery.data.forumPosts.map(p => (
            <tr key={p._id}>
              <td>
                <Link to={`/forums/posts/${p._id}`}>{p.title}</Link>
              </td>
              <td>{p.state}</td>
              <td>{p.stateChangedAt}</td>
              <td>
                {' '}
                {p.stateChangedBy?.username ||
                  p.stateChangedBy?.email ||
                  p.stateChangedBy?._id}
              </td>
              <td>{p.createdAt}</td>
              <td>
                {p.createdBy?.username ||
                  p.createdBy?.email ||
                  p.createdBy?._id}
              </td>
              <td>{p.updatedAt}</td>
              <td>
                {p.updatedBy?.username ||
                  p.updatedBy?.email ||
                  p.updatedBy?._id}
              </td>
              <td>{p.commentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
