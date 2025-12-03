import React from 'react';
import { IconFilter } from '@tabler/icons-react';

const FilterButton = () => {
  return (
    <div className="flex items-center mr-5">
      <button className="flex">
        <IconFilter size={18} />
        <span className="font-medium">Filter</span>
      </button>
    </div>
  );
};

export default FilterButton;
