import React from 'react';

import DealRouteSection from './containers/dealRoute/DealRouteSection';
import DealPlacesSection from './containers/dealPlaces/DealPlacesSection';

export default ({ id }: { id: string }) => {
  return (
    <>
      <DealPlacesSection dealId={id} />
      <DealRouteSection dealId={id} />
    </>
  );
};
