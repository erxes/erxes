import * as compose from 'lodash.flowright';

import {
  Alert,
  confirm,
  router as routerUtils,
  withProps
} from '@erxes/ui/src/utils';
import {
  FilemanagerFoldersQueryResponse,
  RemoveFilemanagerFolderMutationResponse
} from '../../types';
import { IRouterProps, MutationVariables } from '@erxes/ui/src/types';
import { mutations, queries } from '../../graphql';

import FolderList from '../../components/folder/FolderList';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  IRouterProps &
  RemoveFilemanagerFolderMutationResponse;

const FolderListContainer = (props: FinalProps) => {
  const {
    removeMutation,
    filemanagerFoldersQuery,
    queryParams,
    history
  } = props;

  const folders = filemanagerFoldersQuery.filemanagerFolders || [];

  if (folders.length > 0 && !queryParams._id) {
    routerUtils.setParams(history, { _id: folders[0]._id });
  }

  // remove action
  const remove = folderId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: folderId }
      })
        .then(() => {
          Alert.success('You successfully deleted a folder.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    folders,
    loading: false,
    remove
  };

  return <FolderList {...updatedProps} />;
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
    graphql<Props, RemoveFilemanagerFolderMutationResponse, MutationVariables>(
      gql(mutations.filemanagerFolderRemove),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: [
            {
              query: gql(queries.filemanagerFoldersTree),
              variables: {
                isTree: true
              }
            }
          ]
        })
      }
    )
  )(withRouter<FinalProps>(FolderListContainer))
);
