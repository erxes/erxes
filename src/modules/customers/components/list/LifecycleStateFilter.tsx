import React from 'react';
import { withRouter } from 'react-router';

import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import { __, router } from 'modules/common/utils';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IRouterProps } from '../../../common/types';
import { LIFECYCLE_STATE_TYPES } from '../../constants';
import { lifecycleStateChoices } from '../../utils';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  loading: boolean;
  searchable?: boolean;
}

class LifecycleStateFilter extends React.Component<IProps> {
  renderCounts = () => {
    const { history, counts } = this.props;

    const paramKey = 'lifecycleState';

    const onClick = (key, value) => {
      router.setParams(history, { [key]: value });
    };

    return (
      <SidebarList>
        {lifecycleStateChoices(__).map(
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
                  {label}
                  <SidebarCounter>{counts ? counts[value] : 0}</SidebarCounter>
                </a>
              </li>
            );
          }
        )}
      </SidebarList>
    );
  };

  render() {
    const { history } = this.props;

    const onClear = () => {
      router.setParams(history, { lifecycleState: null });
    };

    const extraButtons = router.getParam(history, 'lifecycleState') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="cancel-1" />
      </a>
    );

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter by lifecycle states')}
        collapsible={true}
        name="showFilterByStates"
      >
        <DataWithLoader
          loading={this.props.loading}
          count={Object.keys(LIFECYCLE_STATE_TYPES).length}
          data={this.renderCounts()}
          emptyText="No lifecycle states"
          emptyIcon="type"
          size="small"
          objective={true}
        />
      </Box>
    );
  }
}

export default withRouter<IProps>(LifecycleStateFilter);
