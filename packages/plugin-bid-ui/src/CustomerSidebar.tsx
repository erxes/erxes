import React from 'react';

import Sidebar from './containers/Sidebar';

export default ({ customerId }: { customerId: string }) => {
  return (
    <>
      <Sidebar customerId={customerId} />
    </>
  );
};
