import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import { ITrip } from '../../types';
import DealsSection from './sections/DealsSection';

type Props = {
  trip: ITrip;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { deals } = this.props.trip;

    return (
      <Sidebar wide={true}>
        <DealsSection deals={deals} />
      </Sidebar>
    );
  }
}
