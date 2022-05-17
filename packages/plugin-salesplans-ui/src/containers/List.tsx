import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import List from '../components/List';
// class ListContainer extends React.Component {
//   render() {
//     return <List></List>;
//   }
// }
type Props = {
  data: any;
  refetch: () => void;
};
function ListContainer({ data, refetch }: Props) {
  const [remove] = useMutation(gql(mutations.miniPlanRemove));
  const removedata = (_id: string) => {
    remove({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
  return <List removedata={removedata} data={data} />;
}
export default ListContainer;
