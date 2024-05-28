import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import React from 'react';
import { categoryStatusChoises } from '../../../../utils';

type Props = {};

const CategoryStatusFilter: React.FC<Props> = () => {
  const productParam = 'state';
  const categoryParam = 'status';

  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (key, value) => {
    router.setParams(navigate, location, { [key]: value });
    router.setParams(navigate, location, { categoryId: null });
  };

  return (
    <>
      <Box
        title={__('FILTER CATEGORY BY STATUS')}
        name="showFilterByType"
        isOpen={router.getParam(location, [categoryParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            ({ value, label }) =>
              (value === 'disabled' || value === 'archived') && (
                <li key={value}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(location, [categoryParam]) === value
                        ? 'active'
                        : ''
                    }
                    onClick={onClick.bind(this, categoryParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              )
          )}
        </SidebarList>
      </Box>
      <Box
        title={__('FILTER PRODUCT BY STATUS')}
        name="showFilterByType"
        isOpen={router.getParam(location, [productParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            ({ value, label }, index: number) =>
              value === 'deleted' && (
                <li key={`${value}${index}`}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(location, [productParam]) === value
                        ? 'active'
                        : ''
                    }
                    onClick={onClick.bind(this, productParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              )
          )}
        </SidebarList>
      </Box>
    </>
  );
};

export default CategoryStatusFilter;
