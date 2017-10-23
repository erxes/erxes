import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';

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
        <a href="/settings/brands" className="quick-button">
          <i className="ion-gear-a" />
        </a>

        {window.location.search.includes('brand') ? (
          <a
            tabIndex={0}
            className="quick-button"
            onClick={() => {
              filter('brand', null);
            }}
          >
            <i className="ion-close-circled" />
          </a>
        ) : null}
      </Section.QuickButtons>

      <ul className="sidebar-list">
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
              <span className="counter">{counts[brand._id]}</span>
            </a>
          </li>
        ))}
        {!brands.length ? (
          <EmptyState
            icon={<i className="ion-flag" />}
            text="No brands"
            size="small"
          />
        ) : null}
      </ul>
    </Section>
  );
}

Brands.propTypes = propTypes;

export default Brands;
