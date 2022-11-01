import React from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import {
  FORUM_POST_DETAIL,
  PERMISSION_GROUP_QUERY,
  POST_REFETCH_AFTER_EDIT
} from '../../graphql/queries';
import gql from 'graphql-tag';

const MUT = gql`
  mutation ForumPermissionGroupDelete($_id: ID!) {
    forumPermissionGroupDelete(_id: $_id) {
      _id
    }
  }
`;

const PermissionGroupDetail: React.FC = () => {
  const history = useHistory();
  const { permissionGroupId } = useParams();
  const { data, loading, error } = useQuery(PERMISSION_GROUP_QUERY, {
    variables: { _id: permissionGroupId },
    fetchPolicy: 'network-only'
  });

  const [mutDelete] = useMutation(MUT, {
    variables: {
      _id: permissionGroupId
    },
    onCompleted: () => {
      history.push('/forums/permission-groups');
    },
    onError: e => {
      alert(JSON.stringify(e, null, 2));
    }
  });

  const onClickDelete = async () => {
    if (!confirm('Do you want to delete this permission group?')) return;
    await mutDelete();
  };

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const { forumPermissionGroup } = data;

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>Name: </th>
            <td>{forumPermissionGroup.name}</td>
          </tr>
        </tbody>
      </table>
      <hr />

      <div>
        <button type="button" onClick={onClickDelete}>
          Delete
        </button>
      </div>

      <h3>Users: </h3>
      <ol>
        {(forumPermissionGroup.users || []).map(u => (
          <li>{u.email}</li>
        ))}
      </ol>
    </div>
  );
};

export default PermissionGroupDetail;
