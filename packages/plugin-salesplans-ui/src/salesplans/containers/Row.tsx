import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import RowComponent from '../components/Row';

type Props = {
  data: any;
  refetch: () => void;
};

const RowContainer = (props: Props) => {
  const { data, refetch } = props;

  const [editMutation] = useMutation(gql(mutations.salesLogEdit));
  const [removeMutation] = useMutation(gql(mutations.salesLogRemove));
  const [statusUpdateMutation] = useMutation(
    gql(mutations.salesLogStatusUpdate)
  );

  const salesLogEdit = (_id: string, data: any) => {
    data._id = _id;
    editMutation({ variables: data })
      .then(() => {
        Alert.success('Successfully saved!');
        refetch();
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const salesLogRemove = (_id: string) => {
    confirm().then(() => {
      removeMutation({ variables: { _id } })
        .then(() => {
          refetch();
          Alert.success('Successfully removed!');
        })
        .catch((error: any) => Alert.error(error.message));
    });
  };

  const salesLogStatusUpdate = (_id: string, status: string) => {
    confirm().then(() => {
      statusUpdateMutation({ variables: { _id, status } })
        .then(() => {
          Alert.success('Request successful!');
          refetch();
        })
        .catch((error: any) => Alert.error(error.message));
    });
  };

  return (
    <RowComponent
      data={data}
      editData={salesLogEdit}
      removeData={salesLogRemove}
      statusUpdate={salesLogStatusUpdate}
    />
  );
};

export default RowContainer;
