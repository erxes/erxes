import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import { Alert, confirm } from '@erxes/ui/src/utils';
// local
import { mutations } from '../../graphql';
import RowComponent from '../../components/discount/Row';

type Props = {
  data: any;
};

const RowContainer = (props: Props) => {
  const { data } = props;
  // Hooks
  const [remove] = useMutation(gql(mutations.discountRemove));
  const [edit] = useMutation(gql(mutations.discountEdit));

  const discountRemove = () => {
    confirm()
      .then(() => {
        remove({
          variables: { id: props.data._id },
          refetchQueries: ['discounts']
        })
          .then(() => {
            Alert.success('Request successful!');
          })
          .catch((error: any) => Alert.error(error.message));
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const handleStatus = (status: string) => {
    confirm()
      .then(() => {
        edit({
          variables: { doc: { _id: data._id, status } },
          refetchQueries: ['discounts']
        })
          .then(() => {
            Alert.success('Request successful!');
          })
          .catch((error: any) => Alert.error(error.message));
      })
      .catch((error: any) => Alert.error(error.message));
  };

  return (
    <RowComponent
      {...props}
      remove={discountRemove}
      handleStatus={handleStatus}
    />
  );
};

export default RowContainer;
