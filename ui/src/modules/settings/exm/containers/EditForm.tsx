import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import EditForm from '../components/EditForm';
import { mutations } from '../graphql';
import { Alert } from 'modules/common/utils';

type Props = {
  exm: any;
};

function EditFormContainer(props: Props) {
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

  const edit = (variables: any) => {
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
