import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import { Alert } from 'modules/common/utils';

import AddForm from '../components/AddForm';
import { mutations } from '../graphql';

function AddFormContainer() {
  const [addMutation] = useMutation(gql(mutations.exmsAdd));

  const add = (variables: { name: string }) => {
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
