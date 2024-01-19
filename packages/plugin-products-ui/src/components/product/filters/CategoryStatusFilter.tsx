import React from 'react';
import { withRouter } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { categoryStatusChoises } from '../../../utils';

type Props = {
  searchable?: boolean;
};

type FinalProps = Props & IRouterProps;

const CategoryStatusFilter: React.FC<FinalProps> = (props) => {
  const { history } = props;
  const productParam = 'state';
  const categoryParam = 'status';

  const onClick = (key, value) => {
    router.setParams(history, { [key]: value });
    router.setParams(history, { categoryId: null });
  };

  return (
    <>
      <Box
        title={__('FILTER CATEGORY BY STATUS')}
        name="showFilterByType"
        isOpen={router.getParam(history, [categoryParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            ({ value, label }: { value: string; label: string }) =>
              (value === 'disabled' || value === 'archived') && (
                <li key={Math.random()}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(history, [categoryParam]) === value
                        ? 'active'
                        : ''
                    }
                    onClick={onClick.bind(this, categoryParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              ),
          )}
        </SidebarList>
      </Box>
      <Box
        title={__('FILTER PRODUCT BY STATUS')}
        name="showFilterByType"
        isOpen={router.getParam(history, [productParam])}
      >
        <SidebarList>
          {categoryStatusChoises(__).map(
            (
              { value, label }: { value: string; label: string },
              index: number,
            ) =>
              value === 'deleted' && (
                <li key={index}>
                  <a
                    href="#filter"
                    tabIndex={0}
                    className={
                      router.getParam(history, [productParam]) === value
                        ? 'active'
                        : ''
                    }
                    onClick={onClick.bind(this, productParam, value)}
                  >
                    <FieldStyle>{label}</FieldStyle>
                  </a>
                </li>
              ),
          )}
        </SidebarList>
      </Box>
    </>
  );
};

export default withRouter<IRouterProps>(CategoryStatusFilter);
