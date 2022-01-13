import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import GetConformity from '@erxes/ui-cards/src/conformity/containers/GetConformity';
import React from 'react';
import options from '../options';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="task"
      component={PortableItems}
      queryName={options.queriesName.itemsQuery}
      itemsQuery={options.queries.itemsQuery}
      data={{ options }}
    />
  );
};
