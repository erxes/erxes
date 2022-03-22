import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Route } from 'react-router-dom';
import Container from './containers/Store';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const main = (props: IRouterProps) => {
  // const queryParams = queryString.parse(location.search);
  // return <List queryParams={queryParams} />;
  return <Container text="fjfhkjnn" />;
};

// const routes = () => {
//   return (
//     <React.Fragment>
//       <Route path='/store' exact={true} key='/store' render={main} />
//     </React.Fragment>
//   );
// };

const CustomerDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/PluginDetails'
  )
);

const detail = ({ match }) => {
  const id = match.params.id;

  return <CustomerDetails id={id} />;
};

const routes = () => {
  return (
    <React.Fragment>
      
      {/* <Route
        key="/store/details/:id"
        exact={true}
        path="/store/details/:id"
        component={detail}
      /> */}

      <Route
        key="/store/details"
        exact={true}
        path="/store/details"
        component={detail}
      />

      <Route
        path="/store"
        exact={true}
        key="/store"
        component={main}
      />
    </React.Fragment>
  );
};

export default routes;
