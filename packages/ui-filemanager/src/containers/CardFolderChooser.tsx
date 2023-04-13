import * as compose from 'lodash.flowright';

import {
  FilemanagerFilesQueryResponse,
  FilemanagerFoldersQueryResponse
} from '../types';

import CardFileChooser from '../components/CardFileChooser';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props;

const CardFolderChooser = (props: FinalProps) => {
  const { filemanagerFoldersQuery } = props;

  if (!filemanagerFoldersQuery || filemanagerFoldersQuery.loading) {
    return null;
  }

  const folders = filemanagerFoldersQuery.filemanagerFolders || [];
  const folderId = Object.keys(folders[0]).length !== 0 ? folders[0]._id : '';

  return <CardFileChooser folderId={folderId} folders={folders} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, { parentId: string }>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery'
      }
    )
  )(CardFolderChooser)
);
