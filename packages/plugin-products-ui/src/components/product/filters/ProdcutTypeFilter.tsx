import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';

import Box from '@erxes/ui/src/components/Box';
import { IRouterProps } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { productTypeChoises } from '../../../utils';
// import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  searchable?: boolean;
}

const ProductTypeFilter: React.FC<IProps> = (props) => {
  const { history } = props;

  const paramKey = 'type';

  const onClick = (key, value) => {
    router.setParams(history, { [key]: value });
  };

  return (
    <Box
      title={__('Filter by type')}
      name="showFilterByType"
      isOpen={router.getParam(history, [paramKey])}
    >
      <SidebarList>
        {productTypeChoises(__).map(
          ({ value, label }: { value: string; label: string }) => {
            return (
              <li key={Math.random()}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={
                    router.getParam(history, [paramKey]) === value
                      ? 'active'
                      : ''
                  }
                  onClick={onClick.bind(this, paramKey, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                </a>
              </li>
            );
          },
        )}
      </SidebarList>
    </Box>
  );
};

export default ProductTypeFilter;
