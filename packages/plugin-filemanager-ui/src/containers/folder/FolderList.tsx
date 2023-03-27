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
  const { removeMutation, filemanagerFolders, filemanagerFoldersQuery } = props;

  const getDifference = (array1, array2) => {
    return array1.filter(object1 =>
      array2.some(object2 => object1._id === object2._id)
    );
  };

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

  const childFolders = filemanagerFoldersQuery.filemanagerFolders || [];

  if (childFolders.length !== 0) {
    const difference = [
      ...getDifference(filemanagerFolders, childFolders),
      ...getDifference(childFolders, filemanagerFolders)
    ];

    if (difference.length === 0) {
      Array.prototype.push.apply(filemanagerFolders, childFolders);
    }
  }

  const updatedProps = {
    ...props,
    filemanagerFolders,
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
