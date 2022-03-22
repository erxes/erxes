import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import { Alert } from '@erxes/ui/src/utils';

import AddForm from '../components/AddForm';
import { mutations } from '../graphql';

function AddFormContainer() {
  const [addMutation] = useMutation(gql(mutations.exmsAdd));

  const add = (variables: { name: string }) => {
    addMutation({ variables })
      .then(() => {
        Alert.success('Successfully added');

        window.location.reload();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <AddForm add={add} />;
}

export default AddFormContainer;
