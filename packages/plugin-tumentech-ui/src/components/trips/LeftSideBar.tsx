import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import { ITrip } from '../../types';
import CarSection from './sections/CarSection';
import DriverSection from './sections/DriverSection';
import TripSection from './sections/TripSection';

type Props = {
  trip: ITrip;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const { trip } = this.props;

    return (
      <Sidebar wide={true}>
        <TripSection trip={trip} />
        <DriverSection driver={trip.driver} />
        <CarSection cars={trip.cars} />
      </Sidebar>
    );
  }
}
