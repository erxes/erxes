import React, { PropTypes } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { DropdownToggle, EmptyState } from '/imports/react-ui/common';


const propTypes = {
  brands: PropTypes.array.isRequired,
};

function Brands({ brands }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={brands.length > 5}>
      <Section.Title>Filter by brands</Section.Title>
      <Section.QuickButtons>
        <Dropdown id="dropdown-user" className="quick-button" pullRight>
          <DropdownToggle bsRole="toggle">
            <i className="ion-more" />
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem href={FlowRouter.path('settings/brands/list')}>
              Manage brands
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>

        {
          FlowRouter.getQueryParam('brand')
            ? (
              <a
                tabIndex={0}
                className="quick-button"
                onClick={() => { filter('brand', null); }}
              >
                <i className="ion-close-circled" />
              </a>
            )
            : null
        }
      </Section.QuickButtons>

      <ul className="filters">
        {
          brands.map(brand =>
            <li key={brand._id}>
              <a
                tabIndex={0}
                className={getActiveClass('brand', brand._id)}
                onClick={() => { filter('brand', brand._id); }}
              >
                {brand.name}
                <span className="counter">
                  {Counts.get(`customers.brand.${brand._id}`)}
                </span>
              </a>
            </li>,
          )
        }
        {
          !brands.length ? (
            <EmptyState
              icon={<i className="ion-flag" />}
              text="No brands"
              size="small"
            />) : null
        }
      </ul>
    </Section>
  );
}

Brands.propTypes = propTypes;

export default Brands;
