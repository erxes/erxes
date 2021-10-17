import { Wrapper } from 'erxes-ui';
import React from 'react';
import { Counts } from '../../types';
import BrandFilter from '../containers/filters/BrandFilter';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar>
      <BrandFilter counts={counts.byBrand} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
