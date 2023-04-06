import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';

import Alert from '@erxes/ui/src/utils/Alert';
import FileDetail from '../../components/file/Detail';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { RequestAckMutationResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  queryParams: any;
  fileId: string;
  folderId: string;
};

type FinalProps = {
  filemanagerDetailQuery: any;
  filemanagerLogsQuery: any;
} & Props &
  RequestAckMutationResponse &
  IRouterProps;

const FileDetailContainer = (props: FinalProps) => {
  const {
    filemanagerDetailQuery,
    filemanagerLogsQuery,
    requestAckMutation
  } = props;

  if (
    (filemanagerDetailQuery && filemanagerDetailQuery.loading) ||
    (filemanagerLogsQuery && filemanagerLogsQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

  const requestAck = (variables, callback) => {
    requestAckMutation({
      variables
    })
      .then(() => {
        Alert.success('You successfully acknowledge a file');

        if (callback) {
          callback();
        }
      })
      .catch(error => {
        Alert.error(error.message);

        if (callback) {
          callback();
        }
      });
  };

  const item = filemanagerDetailQuery.filemanagerFileDetail || ({} as any);
  const logs = filemanagerLogsQuery.filemanagerLogs || ([] as any);

  const isViewPermissionDenied =
    filemanagerDetailQuery.error &&
    filemanagerDetailQuery.error.message.includes('Permission denied')
      ? true
      : false;

  const extendedProps = {
    ...props,
    item,
    logs,
    isViewPermissionDenied,
    requestAck
  };

  return <FileDetail {...extendedProps} />;
};

export default compose(
  graphql<Props>(gql(queries.filemanagerFileDetail), {
    name: 'filemanagerDetailQuery',
    options: ({ fileId }: { fileId: string }) => ({
      variables: {
        _id: fileId
      }
    })
  }),
  graphql<Props>(gql(queries.filemanagerLogs), {
    name: 'filemanagerLogsQuery',
    options: ({ fileId }: { fileId: string }) => ({
      variables: {
        contentTypeId: fileId
      }
    })
  }),
  graphql<Props, RequestAckMutationResponse, {}>(
    gql(mutations.filemanagerRequestAcks),
    {
      name: 'requestAckMutation',
      options: ({ folderId }: { folderId: string }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.filemanagerFiles),
              variables: {
                folderId: folderId || ''
              }
            }
          ]
        };
      }
    }
  )
)(FileDetailContainer);
