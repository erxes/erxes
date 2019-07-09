import React from 'react';
import { withRouter } from 'react-router';

import { DataWithLoader, Icon } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IRouterProps } from '../../../common/types';
import { LEAD_STATUS_TYPES } from '../../constants';
import { leadStatusChoices } from '../../utils';

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
    const { Section } = Wrapper.Sidebar;
    const { history } = this.props;

    const onClear = () => {
      router.setParams(history, { leadStatus: null });
    };

    return (
      <Section collapsible={true}>
        <Section.Title>{__('Filter by lead status')}</Section.Title>
        <Section.QuickButtons>
          {router.getParam(history, 'leadStatus') ? (
            <a href="#cancel" tabIndex={0} onClick={onClear}>
              <Icon icon="cancel-1" />
            </a>
          ) : null}
        </Section.QuickButtons>

        <DataWithLoader
          loading={this.props.loading}
          count={Object.keys(LEAD_STATUS_TYPES).length}
          data={this.renderCounts()}
          emptyText="No leads"
          emptyIcon="type"
          size="small"
          objective={true}
        />
      </Section>
    );
  }
}

export default withRouter<IProps>(LeadStatusFilter);
