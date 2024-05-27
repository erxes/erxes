import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Home from './containers/Home';

const neighborItems = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} />;
};

// const list = ({ location, history }) => {
//   return (
//     <CarList
//       queryParams={queryString.parse(location.search)}
//       history={history}
//     />
//   );
// };

const routes = () => {
  return (
    <>
      <Route
        key="/erxes-plugin-neighbor?type=kindergarden"
        exact={true}
        path="/erxes-plugin-neighbor"
        component={neighborItems}
      />
    </>
  );
};

export default routes;
