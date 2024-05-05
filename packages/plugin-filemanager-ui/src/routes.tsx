import React from "react";
import { Route, Routes } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import { useLocation, useParams } from "react-router-dom";

const FileManager = asyncComponent(
  () =>
    import(/* webpackChunkName: "File Manager" */ "./containers/FileManager")
);

const FileDetail = asyncComponent(
  () => import(/* webpackChunkName: "File Detail" */ "./containers/file/Detail")
);

const FolderDetail = asyncComponent(
  () =>
    import(/* webpackChunkName: "Folder Detail" */ "./containers/folder/Detail")
);

const Filemanager = () => {
  const location = useLocation();

  return <FileManager queryParams={queryString.parse(location.search)} />;
};

const Detail = () => {
  const { fileId, folderId } = useParams();
  const location = useLocation();

  return (
    <FileDetail
      queryParams={queryString.parse(location.search)}
      fileId={fileId}
      folderId={folderId}
    />
  );
};

const FolderDetailComponent = () => {
  const { fileId } = useParams();
  const location = useLocation();

  return (
    <FolderDetail
      queryParams={queryString.parse(location.search)}
      fileId={fileId}
    />
  );
};

const routes = () => (
  <Routes>
    <Route key="/filemanager" path="/filemanager" element={<Filemanager />} />

    <Route
      key="/filemanager/details/:folderId/:id"
      path="/filemanager/details/:folderId/:id"
      element={<Detail />}
    />

    <Route
      key="/filemanager/folder/details/:id"
      path="/filemanager/folder/details/:id"
      element={<FolderDetailComponent />}
    />
  </Routes>
);

export default routes;
