import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import List from '../components/List';

type Props = {
  data: any;
  refetch: () => void;
};

function ListContainer(props: Props) {
  const { data, refetch } = props;
  const [edit] = useMutation(gql(mutations.salesLogEdit));
  const [remove] = useMutation(gql(mutations.salesLogRemove));

  const salesLogEdit = (id: string, doc: any) => {
    doc._id = id;
    edit({ variables: doc })
      .then(() => Alert.success('Successfully saved!'))
      .catch((error: any) => Alert.error(error.message));
  };

  const salesLogRemove = (_id: string) => {
    remove({ variables: { _id } })
      .then(() => Alert.success('Successfully removed'))
      .catch((error: any) => Alert.error(error.message));
  };

  return (
    <List data={data} editData={salesLogEdit} removeData={salesLogRemove} />
  );
}
export default ListContainer;
