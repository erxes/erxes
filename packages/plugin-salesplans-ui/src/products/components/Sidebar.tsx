import React from 'react';
import { __, Wrapper, Box, FilterByParams } from '@erxes/ui/src';

type Props = {
  categories: any[];
  loading: boolean;
};

const Sidebar = (props: Props) => {
  const { categories = [], loading = false } = props;

  return (
    <Wrapper.Sidebar>
      <Box isOpen title={__('Filter by Categories')} name="filterByCategories">
        <FilterByParams
          paramKey="categoryId"
          counts={[]}
          loading={loading}
          fields={categories.map((item: any) => {
            return {
              _id: item._id,
              name: item.name
            };
          })}
        />
      </Box>
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
