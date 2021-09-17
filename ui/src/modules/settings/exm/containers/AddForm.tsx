import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import AddForm from '../components/AddForm';
import { mutations } from '../graphql';
import { Alert } from 'modules/common/utils';

function AddFormContainer() {
  const [addMutation] = useMutation(gql(mutations.exmsAdd));

  const add = (variables: any) => {
    addMutation({ variables })
      .then(({ data }) => {
        Alert.success('Successfully added');

        window.location.href = `/settings/exm?_id=${data.exmsAdd._id}`;
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <AddForm add={add} />;
}

export default AddFormContainer;
