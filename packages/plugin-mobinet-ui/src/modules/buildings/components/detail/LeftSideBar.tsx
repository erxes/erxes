import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import { IBuilding } from '../../types';
import AddressSection from './sections/AddressSection';

type Props = {
  building: IBuilding;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    // const { building } = this.props;

    return (
      <Sidebar wide={true}>
        <AddressSection building={this.props.building} />
      </Sidebar>
    );
  }
}
