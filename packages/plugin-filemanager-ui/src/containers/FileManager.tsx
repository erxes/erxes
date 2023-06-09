import * as compose from 'lodash.flowright';

import { router as routerUtils, withProps } from '@erxes/ui/src/utils';

import { AppConsumer } from 'coreui/appContext';
import FileManager from '../components/FileManager';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  currentUserId?: string;
};

type FinalProps = {
  filemanagerFolderDetailQuery?: any;
} & Props &
  IRouterProps;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class FileManagerContainer extends React.Component<FinalProps> {
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

  render() {
    const { filemanagerFolderDetailQuery } = this.props;

    const currentFolder =
      (filemanagerFolderDetailQuery &&
        filemanagerFolderDetailQuery.filemanagerFolderDetail) ||
      {};

    const updatedProps = {
      ...this.props,
      currentFolder,
      onSelect: this.onSelect,
      onSearch: this.onSearch
    };

    return <FileManager {...updatedProps} />;
  }
}

const WithProps = withProps<Props>(
  compose(
    graphql<Props>(gql(queries.filemanagerFolderDetail), {
      name: 'filemanagerFolderDetailQuery',
      skip: ({ queryParams }) => {
        return !queryParams._id;
      },
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
