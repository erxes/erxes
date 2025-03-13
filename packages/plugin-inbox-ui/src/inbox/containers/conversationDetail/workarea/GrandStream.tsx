import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { mutations, queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { Alert, withProps } from '@erxes/ui/src/utils';
import GrandStream from '../../../components/conversationDetail/workarea/grandStream/GrandStream';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';

type Props = {
  conversation: IConversation;
};

const GrandStreamContainer: React.FC<Props> = (props) => {
  const [callSyncRecordFile] = useMutation(gql(mutations.syncCallRecordFile), {
    refetchQueries: [
      {
        query: gql(queries.conversationDetail),
        variables: { _id: props.conversation._id },
      },
    ],
  });

  const syncRecord = async (acctId: string, inboxId: string) => {
    console.log('wqahhahahha:', acctId);
    try {
      if (acctId && inboxId)
        await callSyncRecordFile({ variables: { acctId, inboxId } });
      console.log('Successfully synced record file');
    } catch (e: any) {
      Alert.error(e.message);
    }
  };

  return <GrandStream {...props} syncRecordFile={syncRecord} />;
};

export default GrandStreamContainer;
