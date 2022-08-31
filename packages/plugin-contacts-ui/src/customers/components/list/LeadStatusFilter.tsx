import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, router } from 'coreui/utils';

import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { LEAD_STATUS_TYPES } from '@erxes/ui-contacts/src/customers/constants';
import React from 'react';
import { leadStatusChoices } from '../../utils';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  loading: boolean;
  searchable?: boolean;
}

class LeadStatusFilter extends React.Component<IProps> {
  renderCounts = () => {
    const { history, counts } = this.props;
    const paramKey = 'leadStatus';

    const onClick = (key, value) => {
      router.setParams(history, { [key]: value });
      router.removeParams(history, 'page');
    };

    return (
      <SidebarList>
        {leadStatusChoices(__).map(
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
      router.setParams(history, { leadStatus: null });
    };

    const extraButtons = router.getParam(history, 'leadStatus') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="times-circle" />
      </a>
    );

    return (
      <Box
        extraButtons={extraButtons}
        title={__('Filter by lead status')}
        name="showFilterByStatus"
      >
        <DataWithLoader
          loading={this.props.loading}
          count={Object.keys(LEAD_STATUS_TYPES).length}
          data={this.renderCounts()}
          emptyText="No Forms"
          emptyIcon="type"
          size="small"
          objective={true}
        />
      </Box>
    );
  }
}

export default withRouter<IProps>(LeadStatusFilter);
