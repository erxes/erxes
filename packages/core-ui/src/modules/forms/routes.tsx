import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

import queryString from "query-string";
import React from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";

const Properties = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Properties" */ "./containers/Properties"
    )
);

const FormsContainer = asyncComponent(
  () => import(/* webpackChunkName: "Forms" */ "./containers/Forms")
);

const LeadsContainer = asyncComponent(
  () => import(/* webpackChunkName: "Leads - List" */ "./leads/containers/List")
);

const CreateLead = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Forms - CreateLead" */ "./leads/containers/CreateLead"
    )
);

const EditLead = asyncComponent(
  () => import(/* webpackChunkName: "EditLead" */ "./leads/containers/EditLead")
);

const ResponseList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - FormResponse" */ './containers/ResponseList'
    )
);

const Responses = () => {
  const location = useLocation();

  const queryParams = queryString.parse(location.search);
  const { formId } = useParams();
  

  return <ResponseList queryParams={queryParams} formId={formId} />;
};

const Forms = () => {
  return <FormsContainer />;
};

const PropertiesComp = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Properties queryParams={queryParams} />;
};

const Leads = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <LeadsContainer
      queryParams={queryParams}
      location={location}
      navigate={navigate}
    />
  );
};

const CreateLeadComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CreateLead location={location} navigate={navigate} />;
};

const EditLeadComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { formId } = useParams();

  return <EditLead queryParams={queryParams} formId={formId} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/properties/" element={<PropertiesComp />} />
    <Route path="/forms/" element={<Forms />} />
    <Route path="/forms/leads/" element={<Leads />} />
    <Route path="/forms/leads/create" element={<CreateLeadComponent />} />
    <Route
      key="/forms/leads/edit/:formId"
      path="/forms/leads/edit/:formId"
      element={<EditLeadComponent />}
    />
    <Route
      key="/forms/responses/:formId?"
      path="/forms/responses/:formId?"
      element={<Responses />}
    />
  </Routes>
);

export default routes;
