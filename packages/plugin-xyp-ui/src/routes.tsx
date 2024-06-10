import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

// const List = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "List - Xyps" */ './modules/settings/containers/List'
//   )
// );

const Xyps = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <div></div>; //<List typeId={type} history={history} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/xyps/" element={<Xyps />} />
    </Routes>
  );
};

export default routes;
