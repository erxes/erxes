import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  QuickButton,
  SidebarList,
  SideBarCounter
} from 'modules/layout/styles';
import { EmptyState, Icon } from 'modules/common/components';

const propTypes = {
  counts: PropTypes.object.isRequired,
  integrations: PropTypes.array.isRequired
};

function Integrations({ counts, integrations }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={integrations.length > 5}>
      <Section.Title>Filter by integrations</Section.Title>

      <Section.QuickButtons>
        <QuickButton href="/settings/integrations">
          <Icon icon="gear-a" />
        </QuickButton>

        {window.location.search.includes('integration') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              filter('integration', null);
            }}
          >
            <Icon icon="close-circled" />
          </QuickButton>
        ) : null}
      </Section.QuickButtons>

      <SidebarList>
        {integrations.length ? (
          integrations.map(integration => (
            <li key={integration}>
              <a
                tabIndex={0}
                className={getActiveClass('integration', integration)}
                onClick={() => {
                  filter('integration', integration);
                }}
              >
                {integration}
                <SideBarCounter>{counts[integration]}</SideBarCounter>
              </a>
            </li>
          ))
        ) : (
          <EmptyState icon="arrow-swap" text="No integrations" size="small" />
        )}
      </SidebarList>
    </Section>
  );
}

Integrations.propTypes = propTypes;

export default Integrations;
