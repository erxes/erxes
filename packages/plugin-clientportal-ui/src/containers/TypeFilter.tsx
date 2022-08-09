import React from 'react';
import { Counts } from '@erxes/ui/src/types';

import TypeFilter from '../components/list/TypeFilter';

type Props = {
  counts: Counts;
};

function TypeFilterContainer({ counts }: Props) {
  return (
    <>
      <TypeFilter counts={counts || {}} />
    </>
  );
}

export default TypeFilterContainer;
