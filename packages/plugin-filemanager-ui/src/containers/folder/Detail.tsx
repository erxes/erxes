import * as compose from 'lodash.flowright';

import {
  FilemanagerFilesQueryResponse,
  IFile,
  SaveFileMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import FileDetail from '../../components/file/Detail';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  queryParams: any;
  fileId: string;
};

type FinalProps = {
  filemanagerFolderDetailQuery: any;
  filemanagerLogsQuery: any;
} & Props &
  IRouterProps;

const FolderDetailContainer = (props: FinalProps) => {
  const { filemanagerFolderDetailQuery, filemanagerLogsQuery } = props;

  if (
    (filemanagerFolderDetailQuery && filemanagerFolderDetailQuery.loading) ||
    (filemanagerLogsQuery && filemanagerLogsQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

  const item =
    filemanagerFolderDetailQuery.filemanagerFolderDetail || ({} as any);
  const logs = filemanagerLogsQuery.filemanagerLogs || ([] as any);

  const extendedProps = {
    ...props,
    item,
    logs
  };

  return <FileDetail {...extendedProps} />;
};

export default compose(
  graphql<Props>(gql(queries.filemanagerFolderDetail), {
    name: 'filemanagerFolderDetailQuery',
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
  })
)(FolderDetailContainer);
