import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Alert } from '@erxes/ui/src/utils';
// local
import { queries, mutations } from '../../graphql';
import FormComponent from '../../components/discount/Form';

const FormContainer = () => {
  // Hooks
  const history = useHistory();
  const { id } = useParams();
  const [add] = useMutation(gql(mutations.discountAdd));
  const [edit] = useMutation(gql(mutations.discountEdit));

  const discountDetail = id
    ? useQuery(gql(queries.discountDetail), {
        variables: { id: id },
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
      })
    : {
        data: {},
        loading: false
      };

  // Declaration
  const discountData = discountDetail.data
    ? discountDetail.data.discountDetail
    : {};

  // Functions
  const discountAdd = (data: any) => {
    add({ variables: { doc: data } })
      .then(() => {
        Alert.success('Request successful!');
        history.push('/pricing/discounts');
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  const discountEdit = (data: any) => {
    edit({ variables: { doc: data } })
      .then(() => {
        Alert.success('Request successful!');
        history.push('/pricing/discounts');
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  const submit = (data: any) => {
    if (id) discountEdit(data);
    else discountAdd(data);
  };

  return (
    <DataWithLoader
      data={<FormComponent submit={submit} data={id ? discountData : {}} />}
      loading={id ? discountDetail.loading : false}
    />
  );
};

export default FormContainer;
