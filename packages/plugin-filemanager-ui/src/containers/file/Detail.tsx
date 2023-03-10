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
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  queryParams: any;
  fileId: string;
};

type FinalProps = {
  filemanagerFilesQuery: any;
} & Props &
  IRouterProps &
  SaveFileMutationResponse;

const FileDetailContainer = (props: FinalProps) => {
  const files = props.filemanagerFilesQuery.filemanagerFiles || [];
  const item = files.find(file => file._id === props.fileId) || ({} as any);

  return <FileDetail item={item} />;
};

export default compose(
  graphql<Props, FilemanagerFilesQueryResponse, {}>(
    gql(queries.filemanagerFiles),
    {
      name: 'filemanagerFilesQuery'
    }
  )
)(FileDetailContainer);
