import React from 'react';
import { withRouter } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { categoryStatusChoises } from '../../../utils';

interface IProps extends IRouterProps {
  searchable?: boolean;
}

class CategoryStatusFilter extends React.Component<IProps> {
  render() {
    const { history } = this.props;
    const productParam = 'productStatus';
    const categoryParam = 'categoryStatus';

    const onClear = () => {
      router.setParams(history, { categoryStatus: null });
    };

    const onClearProduct = () => {
      router.setParams(history, { productStatus: null });
    };

    const extraButtons = router.getParam(history, categoryParam) && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    const extraProductButton = router.getParam(history, productParam) && (
      <a href="#cancel" tabIndex={0} onClick={onClearProduct}>
        <Icon icon="cancel-1" />
      </a>
    );
    const onClick = (key, value) => {
      router.setParams(history, { [key]: value });
      router.setParams(history, { categoryId: null });
    };

    return (
      <div>
        <Box
          extraButtons={extraButtons}
          title={__('FILTER CATEGORY BY STATUS')}
          name="showFilterByType"
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
                )
            )}
          </SidebarList>
        </Box>
        <Box
          extraButtons={extraProductButton}
          title={__('FILTER PRODUCT BY STATUS')}
          name="showFilterByType"
        >
          <SidebarList>
            {categoryStatusChoises(__).map(
              (
                { value, label }: { value: string; label: string },
                index: number
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
                )
            )}
          </SidebarList>
        </Box>
      </div>
    );
  }
}

export default withRouter<IProps>(CategoryStatusFilter);
