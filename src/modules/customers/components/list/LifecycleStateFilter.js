import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { Wrapper } from 'modules/layout/components';
import { Icon, DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { LIFECYCLE_STATE_TYPES } from '../../constants';
import { lifecycleStateChoices } from '../../utils';

class LifecycleStateFilter extends Component {
  constructor() {
    super();

    this.renderCounts = this.renderCounts.bind(this);
  }

  renderCounts() {
    const { __ } = this.context;
    const { history, counts } = this.props;
    const { Section } = Wrapper.Sidebar;
    const paramKey = 'lifecycleState';

    return (
      <Section collapsible={true}>
        <Section.Title>{__('Filter by lifecycle states')}</Section.Title>
        <Section.QuickButtons>
          {router.getParam(history, 'lifecycleState') ? (
            <a
              tabIndex={0}
              onClick={() => {
                router.setParams(history, { lifecycleState: null });
              }}
            >
              <Icon icon="cancel-1" />
            </a>
          ) : null}
        </Section.QuickButtons>
        <div>
          <SidebarList>
            {lifecycleStateChoices(__).map(({ value, label }) => {
              return (
                <li key={Math.random()}>
                  <a
                    tabIndex={0}
                    className={
                      router.getParam(history, [paramKey]) === value
                        ? 'active'
                        : ''
                    }
                    onClick={() => {
                      router.setParams(history, { [paramKey]: value });
                    }}
                  >
                    {label}
                    <SidebarCounter>
                      {counts ? counts[value] : 0}
                    </SidebarCounter>
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
        count={Object.keys(LIFECYCLE_STATE_TYPES).length}
        data={this.renderCounts()}
        emptyText="No lifecycle states"
        emptyIcon="type"
        size="small"
        objective={true}
      />
    );
  }
}

LifecycleStateFilter.contextTypes = {
  __: PropTypes.func
};

LifecycleStateFilter.propTypes = {
  history: PropTypes.object.isRequired,
  counts: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  searchable: PropTypes.bool
};

export default withRouter(LifecycleStateFilter);
