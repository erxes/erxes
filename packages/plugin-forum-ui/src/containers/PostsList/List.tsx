import React from 'react';
import { useSearchParam } from '../../hooks';
import { useQuery } from 'react-apollo';
import { FORUM_POSTS_COUNT, FORUM_POSTS_QUERY } from '../../graphql/queries';
import { Link } from 'react-router-dom';
import { postUsername } from '../../utils';

const List: React.FC = () => {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const [categoryApprovalState] = useSearchParam('categoryApprovalState');

  const [perPage] = useSearchParam('perPage');
  const [page] = useSearchParam('page');

  const variables = {
    categoryId,
    state,
    categoryApprovalState,
    categoryIncludeDescendants: !!categoryIncludeDescendants,
    sort: { _id: -1 }
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
            <th>Last published at</th>
            <th>Created At</th>
            <th>Created By</th>
            <th>Updated At</th>
            <th>Updated By</th>
            <th>Comment(s) count</th>
            <th>Up vote count</th>
            <th>Down vote count</th>
            <th>View count</th>
          </tr>
        </thead>
        <tbody>
          {postQuery.data.forumPosts.map(p => (
            <tr key={p._id}>
              <td>
                <Link to={`/forums/posts/${p._id}`}>{p.title}</Link>
              </td>
              <td>{p.state}</td>
              <td>{p.lastPublishedAt}</td>
              <td>{p.createdAt}</td>
              <td>
                {postUsername({
                  post: p,
                  typeKey: 'createdUserType',
                  crmKey: 'createdBy',
                  cpKey: 'createdByCp'
                })}
              </td>
              <td>{p.updatedAt}</td>
              <td>
                {postUsername({
                  post: p,
                  typeKey: 'updatedUserType',
                  crmKey: 'updatedBy',
                  cpKey: 'updatedByCp'
                })}
              </td>
              <td style={{ textAlign: 'right' }}>{p.commentCount}</td>
              <td style={{ textAlign: 'right' }}>{p.upVoteCount}</td>
              <td style={{ textAlign: 'right' }}>{p.downVoteCount}</td>
              <td style={{ textAlign: 'right' }}>{p.viewCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
