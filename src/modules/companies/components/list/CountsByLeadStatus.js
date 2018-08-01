import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { Wrapper } from 'modules/layout/components';
import { Icon, DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { COMPANY_LEAD_STATUS_TYPES } from '../../constants';

class CountsByLeadStatus extends Component {
  constructor() {
    super();

    this.renderCounts = this.renderCounts.bind(this);
  }

  renderCounts() {
    const { __ } = this.context;
    const { history, counts } = this.props;
    const { Section } = Wrapper.Sidebar;
    const paramKey = 'leadStatus';
    const types = COMPANY_LEAD_STATUS_TYPES.sort();

    return (
      <Section collapsible={types.length > 5}>
        <Section.Title>{__('Filter by lead status')}</Section.Title>
        <Section.QuickButtons>
          {router.getParam(history, 'leadStatus') ? (
            <a
              tabIndex={0}
              onClick={() => {
                router.setParams(history, { leadStatus: null });
              }}
            >
              <Icon icon="cancel-1" />
            </a>
          ) : null}
        </Section.QuickButtons>
        <div>
          <SidebarList>
            {types.map(type => {
              return (
                <li key={Math.random()}>
                  <a
                    tabIndex={0}
                    className={
                      router.getParam(history, [paramKey]) === type
                        ? 'active'
                        : ''
                    }
                    onClick={() => {
                      router.setParams(history, { [paramKey]: type });
                    }}
                  >
                    {type || __('No lead status chosen')}
                    <SidebarCounter>{counts ? counts[type] : 0}</SidebarCounter>
                  </a>
                </li>
              );
            })}
          </SidebarList>
        </div>
      </Section>
    );
  }

  render() {
    return (
      <DataWithLoader
        loading={this.props.loading}
        count={COMPANY_LEAD_STATUS_TYPES.length}
        data={this.renderCounts()}
        emptyText="No leads"
        emptyIcon="type"
        size="small"
        objective={true}
      />
    );
  }
}

CountsByLeadStatus.contextTypes = {
  __: PropTypes.func
};

CountsByLeadStatus.propTypes = {
  history: PropTypes.object.isRequired,
  counts: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  searchable: PropTypes.bool
};

export default withRouter(CountsByLeadStatus);
