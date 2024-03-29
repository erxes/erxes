import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";
import queryString from "query-string";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const AssetList = asyncComponent(
  () =>
    import(/* webpackChunkName: "List - Assets" */ "./asset/containers/List")
);

const AssetMovements = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Assets" */ "./movements/movements/containers/List"
    )
);

const AssetMovementItems = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Asset Movement Item" */ "./movements/assets/containers/List"
    )
);

const AssetDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Assets" */ "./asset/containers/detail/Detail"
    )
);

const Assets = () => {
  const location = useLocation();

  return (
    <AssetList
      queryParams={queryString.parse(location.search)}
    />
  );
};

const Detail = () => {
  const location = useLocation();
  const { id } = useParams();

  return (
    <AssetDetail
      queryParams={queryString.parse(location.search)}
      id={id}
    />
  );
};

const Movements = (props) => {
  return (
    <AssetMovements
      {...props}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const MovementItems = (props) => {
  return (
    <AssetMovementItems
      {...props}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/assets/" element={<Assets />} />
      <Route
        path="/settings/assets/detail/:id"
        key="/settings/assets/detail/:id"
        element={<Detail />}
      />
      <Route path="/asset-movements" element={<Movements />} />
      <Route path="/asset-movement-items" element={<MovementItems />} />
    </Routes>
  );
};

export default routes;
