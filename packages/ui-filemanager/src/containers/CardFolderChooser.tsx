import * as compose from 'lodash.flowright';

import {
  FilemanagerFilesQueryResponse,
  FilemanagerFoldersQueryResponse,
  GetRelatedFilesContentTypeQueryResponse
} from '../types';

import CardFileChooser from '../components/CardFileChooser';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
  contentTypeId: string;
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
  const folderId = Object.keys(folders[0]).length !== 0 ? folders[0]._id : '';
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
    graphql<Props, FilemanagerFoldersQueryResponse, {}>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery'
      }
    ),
    graphql<Props, GetRelatedFilesContentTypeQueryResponse, {}>(
      gql(queries.filemanagerGetRelatedFilesContentType),
      {
        name: 'relatedFilesContentTypeQuery',
        options: ({ contentType, contentTypeId }: Props) => ({
          variables: {
            contentType,
            contentTypeId
          }
        })
      }
    )
  )(CardFolderChooser)
);
