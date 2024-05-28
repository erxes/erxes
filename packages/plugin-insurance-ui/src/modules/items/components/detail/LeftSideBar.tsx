import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/tickets/options';
import { InsuranceItem } from '../../../../gql/types';
import CustomFieldSection from '../../containers/CustomFieldSection';
import ItemSection from '../../containers/detail/Item';

type Props = {
  item: InsuranceItem;
};

const LeftSidebar = (props: Props) => {
  const { item } = props;

  return (
    <Sidebar wide={true}>
      <ItemSection item={item}  />
      {/* <PortableItems
       data={{
         options: { ...options, title: 'Deal' },
       }}
       items={item.deal ? [item.deal as any] : []}
       onChangeItem={() => {
         console.log('onChangeItem');
       }}
      /> */}
      <CustomFieldSection item={item}/>
      {/* <ProductsConfigsSection item={item} /> */}
    </Sidebar>
  );
};

export default LeftSidebar;
