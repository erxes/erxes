import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  FilemanagerFoldersQueryResponse,
  IFolder,
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
  filemanagerFolders: IFolder[];
  loading: boolean;
  parentFolderId: string;
  setParentId: (id: string) => void;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  IRouterProps &
  RemoveFilemanagerFolderMutationResponse;

const FolderListContainer = (props: FinalProps) => {
  const { removeMutation, history, filemanagerFoldersQuery } = props;

  const childrens = filemanagerFoldersQuery.filemanagerFolders || [];

  // remove action
  const remove = folderId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: folderId }
      })
        .then(() => {
          Alert.success('You successfully deleted a folder.');

          history.push('/filemanager');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };
  // console.log("aaa", childrens);
  const updatedProps = {
    ...props,
    childrens,
    remove
  };

  return <FolderList {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.filemanagerFolders)
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, { parentId: string }>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery',
        options: ({ parentFolderId }: { parentFolderId: string }) => ({
          variables: {
            parentId: parentFolderId
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, RemoveFilemanagerFolderMutationResponse, MutationVariables>(
      gql(mutations.filemanagerFolderRemove),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: getRefetchQueries()
        })
      }
    )
  )(withRouter<FinalProps>(FolderListContainer))
);
