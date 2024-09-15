import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const CreateLead = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Forms - CreateLead" */ "./containers/CreateLead"
    )
);

const EditLead = asyncComponent(
  () => import(/* webpackChunkName: "EditLead" */ "./containers/EditLead")
);

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Form" */ "./containers/List")
);

const ResponseList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - FormResponse" */ "./containers/ResponseList"
    )
);

const Forms = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <List queryParams={queryParams} location={location} navigate={navigate} />
  );
};

const CreateLeadComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CreateLead location={location} navigate={navigate} />;
};

const EditLeadComponent = () => {
  const { contentTypeId, formId } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <EditLead
      queryParams={queryParams}
      formId={formId}
      contentTypeId={contentTypeId}
    />
  );
};

const ResponseListComponent = () => {
  const { integrationId, formId } = useParams();
  const location = useLocation();

  const queryParams = queryString.parse(location.search);
  queryParams.integrationId = integrationId;
  queryParams.formId = formId;

  return <ResponseList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      {/* <Route path="/forms" element={<Forms />} />
      <Route
        key="/forms/create"
        path="/forms/create"
        element={<CreateLeadComponent />}
      />

      <Route
        key="/forms/edit/:contentTypeId?/:formId?"
        path="/forms/edit/:contentTypeId/:formId?"
        element={<EditLeadComponent />}
      />

      <Route
        key="/forms/responses/:integrationId?/:formId?"
        path="/forms/responses/:integrationId?/:formId?"
        element={<ResponseListComponent />}
      /> */}
    </Routes>
  );
};

export default routes;
