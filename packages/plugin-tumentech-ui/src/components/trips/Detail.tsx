import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import { ITrip } from '../../types';
import Map from '@erxes/ui/src/containers/map/Map';
import { ILocationOption } from '@erxes/ui/src/types';
import RightSidebar from './RightSideBar';
import LeftSideBar from './LeftSideBar';
import { TripTitle } from '../../styles';
import { IField } from '@erxes/ui-segments/src/types';

type Props = {
  trip: ITrip;
  fields: IField[];
};

const TripDetail = (props: Props) => {
  const { trip } = props;

  const { route } = trip;

  const locationOptions: ILocationOption[] = [];
  for (const dir of route.directions) {
    locationOptions.push(dir.places[0].center);
    locationOptions.push(dir.places[1].center);
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
      center={route.directions[0].places[0].center}
      zoom={7}
      locationOptions={[...new Set(locationOptions)]}
      streetViewControl={false}
      connectWithLines={true}
      fullHeight={true}
      trackingData={trip.trackingData}
      googleMapPath={route.directions.map(
        dir => (dir.googleMapPath && dir.googleMapPath) || ''
      )}
    />
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={trip._id} breadcrumb={breadcrumb} />}
      mainHead={<TripTitle>{trip.route.name}</TripTitle>}
      leftSidebar={<LeftSideBar trip={trip} />}
      rightSidebar={<RightSidebar trip={trip} />}
      content={content}
      transparent={true}
    />
  );
};

export default TripDetail;
