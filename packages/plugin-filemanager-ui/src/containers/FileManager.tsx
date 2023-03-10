import * as compose from 'lodash.flowright';

import { router as routerUtils, withProps } from '@erxes/ui/src/utils';

import { AppConsumer } from 'coreui/appContext';
import FileManager from '../components/FileManager';
import { FilemanagerFoldersQueryResponse } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  currentUserId?: string;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
  filemanagerFolderDetailQuery: any;
} & Props &
  IRouterProps;

class FileManagerContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const {
      filemanagerFoldersQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (!filemanagerFoldersQuery || filemanagerFoldersQuery.loading) {
      return;
    }

    const { filemanagerFolders = [], loading } = filemanagerFoldersQuery;

    const parents = filemanagerFolders.filter(f => !f.parentId);

    if (!_id && parents.length !== 0 && !loading) {
      routerUtils.setParams(
        history,
        {
          _id: parents[0]._id
        },
        true
      );
    }
  }

  render() {
    const {
      filemanagerFoldersQuery,
      filemanagerFolderDetailQuery
    } = this.props;

    if (
      (filemanagerFoldersQuery && filemanagerFoldersQuery.loading) ||
      (filemanagerFolderDetailQuery && filemanagerFolderDetailQuery.loading)
    ) {
      return <Spinner objective={true} />;
    }

    const filemanagerFolders = filemanagerFoldersQuery.filemanagerFolders || [];
    const currentFolder =
      filemanagerFolderDetailQuery.filemanagerFolderDetail || ({} as any);

    const updatedProps = {
      ...this.props,
      currentFolder,
      filemanagerFolders,
      folderQueryLoading: filemanagerFoldersQuery.loading
    };

    return <FileManager {...updatedProps} />;
  }
}

const WithProps = withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, {}>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props>(gql(queries.filemanagerFolderDetail), {
      name: 'filemanagerFolderDetailQuery',
      options: ({ queryParams }: { queryParams: any }) => ({
        variables: {
          _id: queryParams && queryParams._id ? queryParams._id : ''
        }
      })
    })
  )(withRouter<FinalProps>(FileManagerContainer))
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
