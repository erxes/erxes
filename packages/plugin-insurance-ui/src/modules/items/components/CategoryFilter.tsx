import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { InsuranceCategory } from '../../../gql/types';
import { FilterLabel } from '../../../styles';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  categories: InsuranceCategory[];
  loading: boolean;
  emptyText?: string;
}

function Categories(props: IProps) {
  const { history, counts, categories = [], loading, emptyText } = props;


  React.useEffect(() => {
    if (categories.length > 0) {
      const category = categories[0];
      router.setParams(history, { category: category._id });


    }
  }
  , [categories]);


  const data = (
    <SidebarList>
      {categories.map((category) => {
        const onClick = () => {
          router.setParams(history, { category: category._id });
          router.removeParams(history, 'page');
          router.removeParams(history, 'product');
        };

        return (
          <li key={category._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'category') === category._id
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FilterLabel>{category.name}</FilterLabel>
              <SidebarCounter>{counts[category._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by category')}
      collapsible={categories.length > 5}
      name="categoryFilter"
      isOpen={true}
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={categories.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Categories);
