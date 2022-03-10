import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Route } from 'react-router-dom';
import Container from './containers/Store';

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


const routes = () => {
  return (
    <>
      {/* <Route
        key="/automations/details/:id"
        exact={true}
        path="/automations/details/:id"
        component={details}
      /> */}
      <Route
        path="/store"
        exact={true}
        key="/store"
        component={main}
      />
    </>
  );
};

export default routes;
