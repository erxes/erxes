import React from 'react';
import { withRouter } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { router, __ } from '@erxes/ui/src/utils';
import { assetStatusChoises } from '../../../common/utils';

interface IProps extends IRouterProps {
  searchable?: boolean;
}

class AssetStatusFilter extends React.Component<IProps> {
  render() {
    const { history } = this.props;

    const onClear = () => {
      router.setParams(history, { status: null });
    };

    const extraButtons = router.getParam(history, 'status') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    const paramKey = 'status';

    const onClick = (key, value) => {
      router.setParams(history, { [key]: value });
      router.setParams(history, { assetId: null });
    };

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter category by status')}
        name="showFilterByType"
      >
        <SidebarList>
          {assetStatusChoises(__).map(
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

export default withRouter<IProps>(AssetStatusFilter);
