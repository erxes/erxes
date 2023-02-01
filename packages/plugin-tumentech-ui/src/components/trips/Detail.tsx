import { IField } from '@erxes/ui-segments/src/types';
import Map from '@erxes/ui/src/containers/map/Map';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { ILocationOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { TripTitle } from '../../styles';
import { ITrip } from '../../types';
import LeftSideBar from './LeftSideBar';
import RightSidebar from './RightSideBar';

type Props = {
  trip: ITrip;
  fields: IField[];
};

const TripDetail = (props: Props) => {
  const { trip } = props;

  const { route, deals } = trip;

  const locationOptions: ILocationOption[] = [];

  if (route && route.directions) {
    for (const dir of route.directions || []) {
      locationOptions.push(dir.places[0].center);
      locationOptions.push(dir.places[1].center);
    }
  }

  let name = trip.route ? trip.route.name || '-' : '-';

  for (const { dealPlace } of deals) {
    if (!dealPlace) {
      continue;
    }

    locationOptions.push(dealPlace.startPlace.center);
    locationOptions.push(dealPlace.endPlace.center);

    name = `${dealPlace.startPlace.province}: ${dealPlace.startPlace.name} - ${dealPlace.endPlace.province}: ${dealPlace.endPlace.name}`;
  }

  const breadcrumb = [
    {
      title: __('Trips'),
      link: '/erxes-plugin-tumentech/trips/list'
    }
  ];

  const content = (
    <Map
      id={Math.random().toString(10)}
      // center={route.directions[0].places[0].center}
      center={{ lat: 47.919, lng: 106.917 }}
      zoom={7}
      locationOptions={[...new Set(locationOptions)]}
      streetViewControl={false}
      connectWithLines={true}
      fullHeight={true}
      trackingData={trip.trackingData}
      googleMapPath={
        route &&
        route.directions.map(
          dir => (dir.googleMapPath && dir.googleMapPath) || ''
        )
      }
    />
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={name} breadcrumb={breadcrumb} />}
      mainHead={<TripTitle>{name}</TripTitle>}
      leftSidebar={<LeftSideBar trip={trip} />}
      rightSidebar={<RightSidebar trip={trip} />}
      content={content}
      transparent={true}
    />
  );
};

export default TripDetail;
