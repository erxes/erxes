import React from 'react';
import PermissionGroupForm from '../../components/PermissionGroupForm';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { queries } from '../../graphql';

const MUTATION = gql`
  mutation ForumPermissionGroupCreate($name: String!) {
    forumPermissionGroupCreate(name: $name) {
      _id
    }
  }
`;

const NewPost: React.FC = () => {
  const [mutation] = useMutation(MUTATION, {
    refetchQueries: queries.permissionGroupRefetch,
    onError: e => alert(JSON.stringify(e, null, 2))
  });

  const history = useHistory();

  const onSubmit = async variables => {
    const {
      data: {
        forumPermissionGroupCreate: { _id }
      }
    } = await mutation({ variables });

    history.push(`/forums/permission-groups/${_id}`);
  };

  return (
    <div>
      <h3>Create new permission group</h3>
      <PermissionGroupForm onSubmit={onSubmit} />
    </div>
  );
};

export default NewPost;
