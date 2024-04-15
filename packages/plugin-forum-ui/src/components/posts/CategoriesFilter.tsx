import { __, router } from '@erxes/ui/src/utils/core';

import Box from '@erxes/ui/src/components/Box';
import FilterByParams from '@erxes/ui/src/components/FilterByParams';
import { ICategory } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";

interface IProps {
  categories: ICategory[];
}

function CategoryFilter({ categories }: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const onClick = () => {
    router.setParams(navigate,location, { categoryId: null });
  };

  const extraButtons = (
    <>
      <Link to={'/forums/categories'}>
        <Icon icon="cog" />
      </Link>

      {router.getParam(location, 'categoryId') && (
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
        location={location}
        navigate={navigate}
      />
    </Box>
  );
}

export default CategoryFilter;
