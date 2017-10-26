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
  brands: PropTypes.array.isRequired
};

function Brands({ counts, brands }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={brands.length > 5}>
      <Section.Title>Filter by brands</Section.Title>
      <Section.QuickButtons>
        <QuickButton href="/settings/brands">
          <Icon icon="gear-a" />
        </QuickButton>

        {window.location.search.includes('brand') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              filter('brand', null);
            }}
          >
            <Icon icon="ion-close-circled" />
          </QuickButton>
        ) : null}
      </Section.QuickButtons>

      <SidebarList>
        {brands.map(brand => (
          <li key={brand._id}>
            <a
              tabIndex={0}
              className={getActiveClass('brand', brand._id)}
              onClick={() => {
                filter('brand', brand._id);
              }}
            >
              {brand.name}
              <SideBarCounter>{counts[brand._id]}</SideBarCounter>
            </a>
          </li>
        ))}
        {!brands.length ? (
          <EmptyState icon="flag" text="No brands" size="small" />
        ) : null}
      </SidebarList>
    </Section>
  );
}

Brands.propTypes = propTypes;

export default Brands;
