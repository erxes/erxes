import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const FileManager = asyncComponent(() =>
  import(/* webpackChunkName: "File Manager" */ './containers/FileManager')
);

const FileDetail = asyncComponent(() =>
  import(/* webpackChunkName: "File Detail" */ './containers/file/Detail')
);

const FolderDetail = asyncComponent(() =>
  import(/* webpackChunkName: "Folder Detail" */ './containers/folder/Detail')
);

const filemanager = ({ location, history }) => {
  return (
    <FileManager
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const detail = ({ location, history, match }) => {
  const fileId = match.params.id;
  const folderId = match.params.folderId;

  return (
    <FileDetail
      queryParams={queryString.parse(location.search)}
      history={history}
      fileId={fileId}
      folderId={folderId}
    />
  );
};

const folderDetail = ({ location, history, match }) => {
  const fileId = match.params.id;

  return (
    <FolderDetail
      queryParams={queryString.parse(location.search)}
      history={history}
      fileId={fileId}
    />
  );
};

const routes = () => (
  <>
    <Route
      key="/filemanager"
      path="/filemanager"
      exact={true}
      component={filemanager}
    />

    <Route
      key="/filemanager/details/:folderId/:id"
      exact={true}
      path="/filemanager/details/:folderId/:id"
      component={detail}
    />

    <Route
      key="/filemanager/folder/details/:id"
      exact={true}
      path="/filemanager/folder/details/:id"
      component={folderDetail}
    />
  </>
);

export default routes;
