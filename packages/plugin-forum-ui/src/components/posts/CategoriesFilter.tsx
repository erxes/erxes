import { __, router } from '@erxes/ui/src/utils/core';

import Box from '@erxes/ui/src/components/Box';
import FilterByParams from '@erxes/ui/src/components/FilterByParams';
import { ICategory } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  categories: ICategory[];
}

function CategoryFilter({ categories }: IProps) {
  const onClick = () => {
    router.setParams(history, { categoryId: null });
  };

  const extraButtons = (
    <>
      <Link to={'/forums/categories'}>
        <Icon icon="cog" />
      </Link>

      {router.getParam(history, 'categoryId') && (
        <a href="#cancel" tabIndex={0} onClick={onClick}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by Categories')}
      collapsible={categories.length > 7}
      name="showFilterByTags"
    >
      <FilterByParams
        fields={categories}
        paramKey="categoryId"
        counts={categories.length}
        loading={false}
        treeView={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(CategoryFilter);
