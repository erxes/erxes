import * as compose from 'lodash.flowright';

import FileDetail from '../../components/file/Detail';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
  fileId: string;
  folderId: string;
};

type FinalProps = {
  filemanagerDetailQuery: any;
  filemanagerLogsQuery: any;
} & Props &
  IRouterProps;

const FileDetailContainer = (props: FinalProps) => {
  const { filemanagerDetailQuery, filemanagerLogsQuery } = props;

  if (
    (filemanagerDetailQuery && filemanagerDetailQuery.loading) ||
    (filemanagerLogsQuery && filemanagerLogsQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

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
    isViewPermissionDenied
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
  })
)(FileDetailContainer);
