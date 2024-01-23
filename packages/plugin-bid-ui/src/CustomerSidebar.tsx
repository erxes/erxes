import React from 'react';

import Sidebar from './containers/Sidebar';

export default ({ customerId, id }: { customerId?: string; id?: string }) => {
  const cId = id || customerId;

  if (!cId) {
    return null;
  }

  return (
    <>
      <Sidebar customerId={cId} />
    </>
  );
};
