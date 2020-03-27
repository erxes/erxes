import React from 'react';
import { withRouter } from 'react-router';

import Box from 'modules/common/components/Box';
import Icon from 'modules/common/components/Icon';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import { productTypeChoises } from '../../../utils';

interface IProps extends IRouterProps {
  searchable?: boolean;
}

class ProductTypeFilter extends React.Component<IProps> {
  render() {
    const { history } = this.props;

    const onClear = () => {
      router.setParams(history, { type: null });
    };

    const extraButtons = router.getParam(history, 'type') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    const paramKey = 'type';

    const onClick = (key, value) => {
      router.setParams(history, { [key]: value });
    };

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter by type')}
        name="showFilterByType"
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
            }
          )}
        </SidebarList>
      </Box>
    );
  }
}

export default withRouter<IProps>(ProductTypeFilter);
