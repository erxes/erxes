import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  FilemanagerFilesQueryResponse,
  FilemanagerFoldersQueryResponse,
  IFolder,
  RemoveFileMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import FileList from '../../components/file/FileList';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;
  // topicId: string;
};

type FinalProps = {
  filemanagerFilesQuery: FilemanagerFilesQueryResponse;
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  RemoveFileMutationResponse;

const FileListContainer = (props: FinalProps) => {
  const {
    filemanagerFilesQuery,
    filemanagerFoldersQuery,
    removeFileMutation,
    queryParams
  } = props;

  // remove action
  const remove = articleId => {
    confirm().then(() => {
      removeFileMutation({
        variables: { _id: articleId }
      })
        .then(() => {
          filemanagerFilesQuery.refetch();

          Alert.success('You successfully deleted a file');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const extendedProps = {
    ...props,
    remove,
    queryParams,
    files: filemanagerFilesQuery.filemanagerFiles || [],
    folders: filemanagerFoldersQuery.filemanagerFolders || [],
    loading: filemanagerFilesQuery.loading
  };

  return <FileList {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, { parentId: string }>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery',
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            parentId: queryParams._id ? queryParams._id : ''
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, FilemanagerFilesQueryResponse, {}>(
      gql(queries.filemanagerFiles),
      {
        name: 'filemanagerFilesQuery',
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            folderId: queryParams._id ? queryParams._id : '',
            search: queryParams.search,
            type: queryParams.type,
            sortField: queryParams.sortField,
            sortDirection: queryParams.sortDirection
              ? parseInt(queryParams.sortDirection, 10)
              : undefined,
            contentType: queryParams.contentType,
            contentTypeId: queryParams.contentTypeId,
            createdAtTo: queryParams.createdAtTo,
            createdAtFrom: queryParams.createdAtFrom
          }
        })
      }
    ),
    graphql<Props, RemoveFileMutationResponse, { folderId: string }>(
      gql(mutations.filemanagerFileRemove),
      {
        name: 'removeFileMutation',
        options: ({ queryParams }: { queryParams: any }) => {
          return {
            refetchQueries: [
              {
                query: gql(queries.filemanagerFiles),
                variables: {
                  folderId: queryParams._id ? queryParams._id : ''
                }
              }
            ]
          };
        }
      }
    )
  )(FileListContainer)
);
