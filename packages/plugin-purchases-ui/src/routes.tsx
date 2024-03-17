import React from 'react';
import PurchaseRotes from './purchases/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <PurchaseRotes />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
