import PortableItems from 'modules/boards/components/portable/Items';
import GetConformity from 'modules/conformity/containers/GetConformity';
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
      relType="ticket"
      component={PortableItems}
      queryName={options.queriesName.itemsQuery}
      itemsQuery={options.queries.itemsQuery}
      data={{ options }}
    />
  );
};
