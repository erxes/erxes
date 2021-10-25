import queryString from 'query-string';
import React from 'react';
import CarList from './containers/CarsList';
import CarDetails from './containers/detail/CarDetails'
import CarSection from './components/common/CarSection'

const details = ({ match }) => {
  const id = match.params.id;

  return <CarDetails id={id} />;
};

const list = ({ location, history }) => {
  return (
    <CarList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};


export default () => ({
  routes: [
    {
      path: '/list',
      component: list
    },
    {
      path: '/details/:id',
      component: details
    }
  ],
  menu: {
    label: 'Plugin Car',
    icon: 'icon-car',
    link: '/list',
    permission: 'showCars'
  },
  customerRightSidebarSection: {
    section: CarSection,
  },
  companyRightSidebarSection: {
    section: CarSection,
  },
  dealRightSidebarSection: {
    section: CarSection,
  },
  webhookActions: [
    { label: 'Car created', action: 'create', type: 'car' },
    { label: 'Car updated', action: 'update', type: 'car' },
    { label: 'Car deleted', action: 'delete', type: 'car' }]
});