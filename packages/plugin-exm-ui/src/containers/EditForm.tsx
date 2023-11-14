import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';

import EditForm from '../components/EditForm';
import { mutations } from '../graphql';
import { IExm } from '../types';

type Props = {
  exm: IExm;
};

function EditFormContainer(props: Props) {
  const [addMutation] = useMutation(gql(mutations.exmsAdd));
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

  const add = (variables: IExm) => {
    editMutation({ variables })
      .then(() => {
        Alert.success('Successfully added');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = (variables: IExm) => {
    editMutation({ variables })
      .then(() => {
        Alert.success('Successfully edited');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <EditForm edit={edit} exm={props.exm} />;
}

export default EditFormContainer;
