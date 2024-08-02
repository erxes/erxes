import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const BusinessPortalMenu = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "BusinessPortalMenu - Settings" */ "./components/Menu"
    )
);

const ClientPortalDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ClientPortalDetail - Settings" */ "./containers/ClientPortalDetail"
    )
);

const ClientPortal = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ClientPortalDetail - Settings" */ "./components/ClientPortal"
    )
);

const ClientPortalUserDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ClientPortalDetails" */ "./containers/details/ClientPortalUserDetails"
    )
);

const ClientPortalCompanyDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ClientPortalDetails" */ "./containers/details/ClientPortalCompanyDetails"
    )
);

const ClientPortalUserList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ClientPortalUserList - Settings" */ "./containers/ClientPortalUserList"
    )
);

const BusinessPortal = () => {
  const location = useLocation();

  const queryParams = queryString.parse(location.search);

  return <BusinessPortalMenu queryParams={queryParams}  />;
};

const ClientPortalComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <ClientPortal queryParams={queryParams}  kind="client" />
  );
};

const VendorPortal = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <ClientPortal queryParams={queryParams}  kind="vendor" />
  );
};

const ConfigsForm = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <ClientPortalDetail queryParams={queryParams}  />;
};

const UserDetail = () => {
  const location = useLocation();
  const { id } = useParams();

  const queryParams = queryString.parse(location.search);
  return (
    <ClientPortalUserDetails
      id={id}
      queryParams={queryParams}
    />
  );
};

const CompanyDetail = () => {
  const { id } = useParams();

  return <ClientPortalCompanyDetails id={id}  />;
};

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  let kind = "client";

  if (location.pathname === "/settings/vendor-portal/user") {
    kind = "vendor";
  }

  return (
    <ClientPortalUserList
      queryParams={queryParams}
      kind={kind}
    />
  );
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/business-portal/"
      path="/settings/business-portal"
      element={<BusinessPortal />}
    />
    <Route
      key="/settings/business-portal/client"
      path="/settings/business-portal/client"
      element={<ClientPortalComponent />}
    />
    <Route
      key="/settings/business-portal/vendor"
      path="/settings/business-portal/vendor"
      element={<VendorPortal />}
    />
    <Route
      key="/settings/client-portal/form"
      path="/settings/client-portal/form"
      element={<ConfigsForm />}
    />
    <Route
      key="/settings/client-portal/users/details/:id"
      path="/settings/client-portal/users/details/:id"
      element={<UserDetail />}
    />
    <Route
      key="/settings/client-portal/companies/details/:id"
      path="/settings/client-portal/companies/details/:id"
      element={<CompanyDetail />}
    />
    <Route
      key="/settings/client-portal/user"
      path="/settings/client-portal/user"
      element={<List />}
    />

    <Route
      key="/settings/vendor-portal/user"
      path="/settings/vendor-portal/user"
      element={<List />}
    />
  </Routes>
);

export default routes;
