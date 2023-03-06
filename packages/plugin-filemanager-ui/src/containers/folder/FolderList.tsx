import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  FilemanagerFoldersQueryResponse,
  RemoveFilemanagerFolderMutationResponse,
  SaveFilemanagerFolderMutationResponse,
  SaveFilemanagerFolderMutationVariables
} from '../../types';
import {
  IButtonMutateProps,
  IRouterProps,
  MutationVariables
} from '@erxes/ui/src/types';
import { mutations, queries } from '../../graphql';

import { AppConsumer } from 'coreui/appContext';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { ChannelsQueryResponse } from '@erxes/ui-inbox/src/settings/channels/types';
import FolderList from '../../components/folder/FolderList';
import React from 'react';
import { RemovePipelineLabelMutationResponse } from '@erxes/ui-cards/src/boards/types';
import Sidebar from '../../components/folder/FolderList';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import inboxQueries from '@erxes/ui-inbox/src/inbox/graphql/queries';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  currentChannelId?: string;
  currentUserId?: string;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  IRouterProps &
  RemoveFilemanagerFolderMutationResponse;

const FolderListContainer = (props: FinalProps) => {
  const {
    filemanagerFoldersQuery,
    removeMutation,
    queryParams,
    history,
    currentChannelId,
    currentUserId
  } = props;

  const filemanagerFolders = filemanagerFoldersQuery.filemanagerFolders || [];

  // remove action
  const remove = folderId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: folderId }
      })
        .then(() => {
          Alert.success('You successfully deleted a folder.');

          history.push('/settings/foldermanager');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    filemanagerFolders,
    remove,
    loading: filemanagerFoldersQuery.loading
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

const WithProps = withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, { perPage: number }>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery',
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
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

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <WithProps
        {...props}
        currentUserId={(currentUser && currentUser._id) || ''}
      />
    )}
  </AppConsumer>
);
