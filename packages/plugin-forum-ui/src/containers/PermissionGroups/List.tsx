import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

const List: React.FC = () => {
  const { data, loading, error } = useQuery(
    gql(queries.permissionGroupsQuery),
    {
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return null;
  }
  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const { forumPermissionGroups } = data;

  return (
    <div>
      <Link to="/forums/permission-groups/new">
        Create new permission group
      </Link>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(forumPermissionGroups || []).map(g => (
            <tr key={g._id}>
              <td> {g.name}</td>
              <td>
                <Link to={`/forums/permission-groups/${g._id}/edit`}>Edit</Link>
              </td>
              <td>
                <Link to={`/forums/permission-groups/${g._id}`}>Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
