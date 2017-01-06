import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
};

function Sidebar({ brands, integrations }) {
  function filter(queryParamName, value) {
    FlowRouter.setQueryParams({ [queryParamName]: value });
  }

  function getActiveClass(queryParamName, value) {
    return FlowRouter.getQueryParam(queryParamName) === value ? 'active' : '';
  }

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section collapsible length={brands.length}>
        <h3>
          Filter by brands
          <a
            href="#"
            className="quick-button"
            onClick={(e) => {
              e.preventDefault();
              filter('brand', null);
            }}
          >
            Clear
          </a>
        </h3>
        <ul className="filters">
          {
            brands.map(brand =>
              <li key={brand._id}>
                <a
                  href="#"
                  className={getActiveClass('brand', brand._id)}
                  onClick={(e) => {
                    e.preventDefault();
                    filter('brand', brand._id);
                  }}
                >
                  {brand.name}
                  <span className="counter">
                    {Counts.get(`customers.brand.${brand._id}`)}
                  </span>
                </a>
              </li>
            )
          }
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section collapsible length={integrations.length}>
        <h3>
          Filter by integrations
          <a
            href="#"
            className="quick-button"
            onClick={(e) => {
              e.preventDefault();
              filter('integration', null);
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
                  href="#"
                  className={getActiveClass('integration', integration)}
                  onClick={(e) => {
                    e.preventDefault();
                    filter('integration', integration);
                  }}
                >
                  {integration}
                  <span className="counter">
                    {Counts.get(`customers.integration.${integration}`)}
                  </span>
                </a>
              </li>
            )
          }
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
