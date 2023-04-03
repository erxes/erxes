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
import queryString from 'query-string';
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

const FILTER_PARAMS = ['search', 'folderId', 'contentTypeId', 'createdAtFrom'];

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

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

  onSearch = (search: string) => {
    if (!search) {
      return routerUtils.removeParams(this.props.history, 'search');
    }

    routerUtils.setParams(this.props.history, { search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);

    if (params[key] === values) {
      return routerUtils.removeParams(this.props.history, key);
    }

    return routerUtils.setParams(this.props.history, { [key]: values });
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);

    const remainedParams = Object.keys(params).filter(
      key => !['_id'].includes(key)
    );

    routerUtils.removeParams(this.props.history, ...remainedParams);
  };

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
      folderQueryLoading: filemanagerFoldersQuery.loading,
      onSelect: this.onSelect,
      isFiltered: this.isFiltered,
      clearFilter: this.clearFilter,
      onSearch: this.onSearch
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
