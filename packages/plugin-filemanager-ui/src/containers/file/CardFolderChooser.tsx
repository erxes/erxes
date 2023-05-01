import * as compose from 'lodash.flowright';

import {
  FilemanagerFoldersQueryResponse,
  GetRelatedFilesContentTypeQueryResponse
} from '../../types';

import CardFileChooser from '../../components/file/CardFileChooser';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  mainType: string;
  mainTypeId: string;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
  relatedFilesContentTypeQuery: GetRelatedFilesContentTypeQueryResponse;
} & Props;

const CardFolderChooser = (props: FinalProps) => {
  const { filemanagerFoldersQuery, relatedFilesContentTypeQuery } = props;

  if (
    !filemanagerFoldersQuery ||
    filemanagerFoldersQuery.loading ||
    !relatedFilesContentTypeQuery ||
    relatedFilesContentTypeQuery.loading
  ) {
    return null;
  }

  const folders = filemanagerFoldersQuery.filemanagerFolders || [];
  const folderId =
    folders.length && Object.keys(folders[0]).length !== 0
      ? folders[0]._id
      : '';
  const relatedFiles =
    relatedFilesContentTypeQuery.filemanagerGetRelatedFilesContentType || [];

  return (
    <CardFileChooser
      {...props}
      folderId={folderId}
      folders={folders}
      relatedFiles={relatedFiles}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse>(
      gql(queries.filemanagerFoldersTree),
      {
        name: 'filemanagerFoldersQuery',
        options: () => ({
          variables: { isTree: true },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, GetRelatedFilesContentTypeQueryResponse, {}>(
      gql(queries.filemanagerGetRelatedFilesContentType),
      {
        name: 'relatedFilesContentTypeQuery',
        options: ({ mainType, mainTypeId }: Props) => ({
          variables: {
            contentType: mainType,
            contentTypeId: mainTypeId
          }
        })
      }
    )
  )(CardFolderChooser)
);
