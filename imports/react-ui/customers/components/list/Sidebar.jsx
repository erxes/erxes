import React, { PropTypes } from 'react';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
};

function Sidebar({ brands, integrations }) {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section collapsible length={brands.length}>
        <h3>
          Filter by brands
          <a
            tabIndex={0}
            className="quick-button"
            onClick={() => { Wrapper.Sidebar.filter('brand', null); }}
          >
            Clear
          </a>
        </h3>
        <ul className="filters">
          {
            brands.map(brand =>
              <li key={brand._id}>
                <a
                  tabIndex={0}
                  className={Wrapper.Sidebar.getActiveClass('brand', brand._id)}
                  onClick={() => { Wrapper.Sidebar.filter('brand', brand._id); }}
                >
                  {brand.name}
                  <span className="counter">
                    {Counts.get(`customers.brand.${brand._id}`)}
                  </span>
                </a>
              </li>,
            )
          }
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section collapsible length={integrations.length}>
        <h3>
          Filter by integrations
          <a
            tabIndex={0}
            className="quick-button"
            onClick={(e) => {
              e.preventDefault();
              Wrapper.Sidebar.filter('integration', null);
            }}
          >
            Clear
          </a>
        </h3>
        <ul className="filters">
          {
            integrations.map(integration =>
              <li key={integration}>
                <a
                  tabIndex={0}
                  className={Wrapper.Sidebar.getActiveClass('integration', integration)}
                  onClick={() => { Wrapper.Sidebar.filter('integration', integration); }}
                >
                  {integration}
                  <span className="counter">
                    {Counts.get(`customers.integration.${integration}`)}
                  </span>
                </a>
              </li>,
            )
          }
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
