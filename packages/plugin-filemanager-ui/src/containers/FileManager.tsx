import * as compose from 'lodash.flowright';

import { router as routerUtils, withProps } from '@erxes/ui/src/utils';

import { AppConsumer } from 'coreui/appContext';
import FileManager from '../components/FileManager';
import { FilemanagerFoldersQueryResponse } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
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
} & Props &
  IRouterProps;

class FileManagerContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const {
      filemanagerFoldersQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (!filemanagerFoldersQuery) {
      return;
    }

    const { filemanagerFolders, loading } = filemanagerFoldersQuery;

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
    const { filemanagerFoldersQuery, history } = this.props;

    const filemanagerFolders = filemanagerFoldersQuery.filemanagerFolders || [];

    const updatedProps = {
      ...this.props,
      filemanagerFolders,
      folderQueryLoading: filemanagerFoldersQuery.loading
    };

    return <FileManager {...updatedProps} />;
  }
}

const WithProps = withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse, { perPage: number }>(
      gql(queries.filemanagerFolders),
      {
        name: 'filemanagerFoldersQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    )
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
