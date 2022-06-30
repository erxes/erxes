import React from 'react';
import { useMutation } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import ActionBarComponent from '../components/ActionBar';

type Props = {
  refetch: () => void;
};

const ActionBarContainer = (props: Props) => {
  const { refetch } = props;
  const [addMutation] = useMutation(gql(mutations.salesLogAdd));

  const salesLogAdd = (data: any) => {
    addMutation({ variables: { ...data } })
      .then(() => {
        Alert.success('Successfully saved!');
        refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  return <ActionBarComponent addData={salesLogAdd} />;
};

export default ActionBarContainer;
