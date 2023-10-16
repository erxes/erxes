import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Alert from '@erxes/ui/src/utils/Alert';

const GET_DATA = gql`
  query PolarisGetData($customerId: String!) {
    polarisGetData(customerId: $customerId) {
      _id
      createdAt
      customerId
      updatedAt
      data
    }
  }
`;

const UPDATE_DATA = gql`
  mutation PolarisUpdateData($customerId: String!) {
    polarisUpdateData(customerId: $customerId) {
      _id
      createdAt
      updatedAt
      customerId
      data
    }
  }
`;

type Props = {
  customerId: string;
};

function AccoutSectionContainer(props: Props) {
  const { customerId } = props;

  const { data, loading, refetch } = useQuery(GET_DATA, {
    variables: { customerId },
    fetchPolicy: 'network-only'
  });

  const [updateMutation] = useMutation(UPDATE_DATA);

  if (loading) {
    return <Spinner />;
  }

  let polarisData: any = data.polarisGetData;

  const updateData = () => {
    updateMutation({ variables: { customerId } })
      .then(res => {
        Alert.success('Successfully updated');
        polarisData = res.data.polarisUpdateData;

        refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <Sidebar {...props} polarisData={polarisData} updateData={updateData} />
  );
}

export default AccoutSectionContainer;
