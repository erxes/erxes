import React from 'react';

import DealRouteSection from './containers/dealRoute/DealRouteSection';

export default ({ id }: { id: string }) => {
  return <DealRouteSection dealId={id} />;
};
