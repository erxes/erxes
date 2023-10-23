import React from 'react';

import Sidebar from './containers/Sidebar';

export default ({ id }: { id: string }) => {
  return (
    <>
      <Sidebar customerId={id} />
    </>
  );
};
