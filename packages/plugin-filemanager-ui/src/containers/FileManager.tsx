import * as compose from 'lodash.flowright';

import { AppConsumer } from 'coreui/appContext';
import FileManager from '../components/FileManager';
import { FilemanagerFoldersQueryResponse } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
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
