import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';
import TransferCallForm from '../components/TransferCall';
import { Alert } from '@erxes/ui/src/utils';
import { callPropType } from '../lib/types';

type Props = {
  inboxId: string;
  closeModal: any;
};
const TransferCall = (props: Props, context) => {
  const { inboxId } = props;
  let direction = context.call?.direction?.split('/')[1];
  direction = direction?.toLowerCase() || '';
  const { data, loading } = useQuery(gql(queries.callExtensionList), {
    variables: {
      integrationId: inboxId,
    },
    pollInterval: 8000,
  });

  const [transferCall] = useMutation(gql(mutations.callTransfer), {
    refetchQueries: ['callExtensionList'],
  });

  const transfer = (extensionNumber: string) => {
    localStorage.setItem('transferredCallStatus', 'local');

    transferCall({
      variables: {
        extensionNumber,
        integrationId: inboxId,
        direction: direction || 'incoming',
      },
    })
      .then(({ data }) => {
        if (data?.callTransfer === 'failed') {
          Alert.error('Failed transfer');
        } else {
          Alert.success('Successfully transferred');
        }
        props.closeModal();
      })
      .catch((e) => {
        Alert.error(e.message);
        props.closeModal();
        localStorage.removeItem('transferredCallStatus');
      });
  };

  if (loading) {
    return <></>;
  }

  const list = data?.callExtensionList || [];
  const filteredList = list.filter((item) => item.status !== 'Unavailable');

  return (
    <TransferCallForm
      datas={filteredList}
      callTransfer={transfer}
      closeModal={props.closeModal}
    />
  );
};

TransferCall.contextTypes = {
  call: callPropType,
};
export default TransferCall;
