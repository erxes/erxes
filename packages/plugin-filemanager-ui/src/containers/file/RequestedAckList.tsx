import * as compose from 'lodash.flowright';

import {
  AckRequestMutationResponse,
  ConfirmRequestMutationResponse,
  RequestAccessMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import RequestAccessForm from '../../components/file/RequestAccessForm';
import RequestedFileList from '../../components/file/RequestedFilesList';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  fileId: string;
  folderId: string;
};

type FinalProps = {
  getAckRequestQuery: any;
} & Props &
  AckRequestMutationResponse;

const RequestedAckListContainer = ({
  ackRequestMutation,
  getAckRequestQuery
}: FinalProps) => {
  if (getAckRequestQuery && getAckRequestQuery.loading) {
    return <Spinner objective={true} />;
  }

  const onConfirm = (requestId: string) => {
    ackRequestMutation({
      variables: {
        _id: requestId
      }
    })
      .then(() => {
        Alert.success('Successfully acknowledged!');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const ackRequest =
    getAckRequestQuery.filemanagerGetAckRequests || ([] as any);

  return (
    <RequestedFileList
      requests={ackRequest}
      onConfirm={onConfirm}
      type="acknowledge"
      hideActions={true}
    />
  );
};

export default compose(
  graphql<Props>(gql(queries.filemanagerGetAckRequests), {
    name: 'getAckRequestQuery',
    options: ({ fileId }: { fileId: string }) => ({
      variables: {
        fileId
      }
    })
  })
  // graphql<Props, AckRequestMutationResponse, {}>(
  //   gql(mutations.filemanagerAckRequest),
  //   {
  //     name: "ackRequestMutation",
  //     options: ({ folderId }: { folderId: string }) => {
  //       return {
  //         refetchQueries: [
  //           {
  //             query: gql(queries.filemanagerFiles),
  //             variables: {
  //               folderId: folderId || "",
  //             },
  //           },
  //         ],
  //       };
  //     },
  //   }
  // )
)(RequestedAckListContainer);
