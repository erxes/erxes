import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Map from '@erxes/ui/src/containers/map/Map';
import { ILocationOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import DealRouteForm from '../../containers/dealRoute/Form';
import { IDealRoute } from '../../types';

export type Props = {
  dealId: string;
  dealRoute?: IDealRoute;
};

export default function Component({ dealRoute, dealId }: Props) {
  const renderBody = (dealRoute?: IDealRoute) => {
    if (!dealRoute || !dealRoute.routeId) {
      return <EmptyState icon="location-point" text="No data" />;
    }

    const { route } = dealRoute;
    const { directions } = route;

    const locationOptions: ILocationOption[] = [];
    for (const dir of directions) {
      locationOptions.push(dir.places[0].center);
      locationOptions.push(dir.places[1].center);
    }

    return (
      <div style={{ width: '100%', backgroundColor: 'black' }}>
        {directions &&
          directions.length &&
          locationOptions &&
          locationOptions.length && (
            <Map
              id={Math.random().toString(10)}
              center={directions[0].places[0].center}
              zoom={7}
              locationOptions={[...new Set(locationOptions)]}
              streetViewControl={false}
              connectWithLines={true}
              googleMapPath={directions.map(
                dir => (dir.googleMapPath && dir.googleMapPath) || ''
              )}
            />
          )}
      </div>
    );
  };

  const manageRoutes = props => (
    <DealRouteForm
      dealId={dealId}
      dealRoute={dealRoute}
      closeModal={props.closeModal}
    />
  );

  const extraButtons = (
    <>
      <ModalTrigger
        title="Route information"
        size="lg"
        trigger={
          <button>
            <Icon icon={dealRoute ? 'edit-3' : 'plus-circle'} />
          </button>
        }
        content={manageRoutes}
      />
    </>
  );

  return (
    <Box
      title={__('Route information')}
      extraButtons={extraButtons}
      isOpen={true}
      name="showLocation"
    >
      {renderBody(dealRoute)}
    </Box>
  );
}
