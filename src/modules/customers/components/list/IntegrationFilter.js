import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';

const propTypes = {
  history: PropTypes.object,
  counts: PropTypes.object.isRequired
};

function IntegrationFilter({ history, counts }, { __ }) {
  const { Section, Header } = Wrapper.Sidebar;

  const data = (
    <SidebarList>
      {KIND_CHOICES.ALL_LIST.map((kind, index) => (
        <li key={index}>
          <a
            tabIndex={0}
            className={
              router.getParam(history, 'integrationType') === kind
                ? 'active'
                : ''
            }
            onClick={() => {
              router.setParams(history, { integrationType: kind });
            }}
          >
            {kind}
            <SidebarCounter>{counts[kind]}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Section>
      <Header uppercase>{__('Filter by integrations')}</Header>

      <DataWithLoader
        data={data}
        loading={false}
        count={KIND_CHOICES.ALL_LIST.length}
        emptyText="No integrations"
        emptyIcon="pie-graph"
        size="small"
        objective={true}
      />
    </Section>
  );
}

IntegrationFilter.propTypes = propTypes;
IntegrationFilter.contextTypes = {
  __: PropTypes.func
};

export default withRouter(IntegrationFilter);
