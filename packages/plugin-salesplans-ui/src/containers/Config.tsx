import React, { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import Config from '../components/Config';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
// class ConfigContainer extends React.Component {
//   render() {
//     return <Config></Config>;
//   }
// }
type Props = {
  closeModal: () => void;
};

function ConfigContainer({ closeModal }: Props) {
  useEffect(() => {
    refetch();
  }, []);

  const dayConfigQuery = useQuery(gql(queries.getTimeframes));

  if (dayConfigQuery.error) {
    return <div>{dayConfigQuery.error.message}</div>;
  }

  const [save] = useMutation(gql(mutations.saveTimeframes));

  const [remove] = useMutation(gql(mutations.removeTimeframe));

  const saveData = (update, add) => {
    save({ variables: { update, add } })
      .then(() => {
        Alert.success('Day Configs successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const refetch = () => {
    dayConfigQuery.refetch();
  };

  const removedata = (_id: string) => {
    remove({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <Config
      save={saveData}
      data={dayConfigQuery.data ? dayConfigQuery.data.getTimeframes : []}
      closeModal={closeModal}
      // refetch={refetch}
      removedata={removedata}
    />
  );
}
export default ConfigContainer;
