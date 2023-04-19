// import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
// import queryString from 'query-string';
// import React from 'react';
// import { Route } from 'react-router-dom';

// const List = asyncComponent(() =>
//   import(/* webpackChunkName: "List - DigitalIncomeRooms" */ './containers/List')
// );

// const digitalIncomeRooms = ({ location, history }) => {
//   const queryParams = queryString.parse(location.search);
//   const { type } = queryParams;

//   return <List typeId={type} history={history} />;
// };

// const routes = () => {
//   return <Route path="/digitalIncomeRooms/" component={digitalIncomeRooms} />;
// };

// export default routes;
import { Route, Switch } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const SitesListContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "Websites - ListContainer" */ './containers/templates/List'
  )
);

const SiteForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SiteForm - XBuilders" */ './containers/sites/SiteForm'
  )
);

const DigitalIncomeRoomContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - XBuilderContainer" */ './containers/DigitalIncomeRoom'
  )
);

const DigitalIncomeRoomSitesContainer = history => {
  const { location, match } = history;
  const queryParams = queryString.parse(location.search);
  const { step } = match.params;
  return <DigitalIncomeRoomContainer step={step} queryParams={queryParams} />;
};

const digitalIncomeRoomSitesCreate = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const { step } = match.params;

  return <SitesListContainer step={step} queryParams={queryParams} />;
};

const digitalIncomeRoomSitesCreateSitesEdit = ({ match, location }) => {
  const _id = match.params._id;
  const queryParams = queryString.parse(location.search);

  return <SiteForm _id={_id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Switch>
      <Route
        path="/digitalIncomeRooms"
        exact={true}
        component={DigitalIncomeRoomSitesContainer}
      />

      <Route
        path="/digitalIncomeRooms/room/create"
        exact={true}
        component={digitalIncomeRoomSitesCreate}
      />

      <Route
        path="/digitalIncomeRooms/room/edit/:_id"
        exact={true}
        component={digitalIncomeRoomSitesCreateSitesEdit}
      />
    </Switch>
  );
};

export default routes;
