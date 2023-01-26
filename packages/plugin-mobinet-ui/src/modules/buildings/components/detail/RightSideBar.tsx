import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import { IBuilding } from '../../types';

// import DealsSection from './sections/DealsSection';

import CustomerSection from './sections/CustomerSection';

type Props = {
  building: IBuilding;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    return (
      <Sidebar wide={true}>
        <CustomerSection building={this.props.building} />
      </Sidebar>
    );
  }
}
