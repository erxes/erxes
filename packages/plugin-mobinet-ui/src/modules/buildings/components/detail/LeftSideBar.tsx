import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import { IBuilding } from '../../types';
import AddressSection from './sections/AddressSection';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/tickets/options';
import ProductsConfigsSection from './sections/ProductsConfigsSection';

type Props = {
  building: IBuilding;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const { building } = this.props;
    const installationRequestIds = building.installationRequestIds || [];

    let title = 'Installation requests';

    if (installationRequestIds.length > 0) {
      title += ` (${installationRequestIds.length})`;
    }

    return (
      <Sidebar wide={true}>
        <AddressSection building={building} />
        <PortableItems
          data={{
            options: { ...options, title },
            hideExtraButton: true
          }}
          items={building.installationRequests}
          onChangeItem={() => {
            console.log('onChangeItem');
          }}
        />
        {/* <ProductsConfigsSection building={building} /> */}
      </Sidebar>
    );
  }
}
