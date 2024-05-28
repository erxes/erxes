import React from 'react';

import AccountSection from './containers/account/AccountSection';

export default ({ id }: { id: string }) => {
  return (
    <>
      <AccountSection customerId={id} />
    </>
  );
};
