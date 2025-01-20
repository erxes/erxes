import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

const SegmentsList = asyncComponent(
  () =>
    import(/* webpackChunkName: "SegmentsList" */ "./containers/SegmentsList")
);

const SegmentsForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SegmentsForm" */ "@erxes/ui-segments/src/containers/form/SegmentsForm"
    )
);

const Segments = () => {
  const location = useLocation();

  const queryParams = queryString.parse(location.search);

  const { contentType } = queryParams;

  return <SegmentsList queryParams={queryParams} contentType={contentType} />;
};

const SegmentsFormComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const { contentType } = queryParams;

  return <SegmentsForm history={navigate} contentType={contentType} />;
};

const SegmentsEditForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const { contentType, id } = queryParams;

  return <SegmentsForm id={id} history={navigate} contentType={contentType} />;
};

const SegmentRoutes = () => {
  return (
    <Routes>
      <Route key="/segments/" path="/segments/" element={<Segments />} />

      <Route
        key="/segments/new/"
        path="/segments/new/"
        element={<SegmentsFormComponent />}
      />

      <Route
        key="/segments/edit/"
        path="/segments/edit/"
        element={<SegmentsEditForm />}
      />
    </Routes>
  );
};

export default SegmentRoutes;
