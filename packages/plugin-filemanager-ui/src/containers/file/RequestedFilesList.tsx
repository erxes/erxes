import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import { ConfirmRequestMutationResponse } from '../../types';
import React from 'react';
import RequestedFileList from '../../components/file/RequestedFilesList';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  fileId: string;
};

type FinalProps = {
  getAccessRequestQuery: any;
} & Props &
  ConfirmRequestMutationResponse;

const RequestedFilesListContainer = ({
  confirmRequestMutation,
  getAccessRequestQuery
}: FinalProps) => {
  if (getAccessRequestQuery && getAccessRequestQuery.loading) {
    return <Spinner objective={true} />;
  }

  const onConfirm = (requestId: string) => {
    confirmRequestMutation({
      variables: {
        requestId
      }
    })
      .then(() => {
        Alert.success('Request confirmed!');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const accessRequests =
    getAccessRequestQuery.filemanagerGetAccessRequests || ([] as any);

  return <RequestedFileList requests={accessRequests} onConfirm={onConfirm} />;
};

export default compose(
  graphql<Props>(gql(queries.filemanagerGetAccessRequests), {
    name: 'getAccessRequestQuery',
    options: ({ fileId }: { fileId: string }) => ({
      variables: {
        fileId
      }
    })
  }),
  graphql<Props, ConfirmRequestMutationResponse, {}>(
    gql(mutations.filemanagerConfirmAccessRequest),
    {
      name: 'confirmRequestMutation',
      options: ({ fileId }: { fileId: string }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.filemanagerGetAccessRequests),
              variables: {
                fileId
              }
            }
          ]
        };
      }
    }
  )
)(RequestedFilesListContainer);
