import React, { PropTypes } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { DropdownToggle, EmptyState } from '/imports/react-ui/common';


const propTypes = {
  segments: PropTypes.array.isRequired,
};

function Segments({ segments }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={segments.length > 5}>
      <Section.Title>Filter by segments</Section.Title>

      <Section.QuickButtons>
        <Dropdown id="dropdown-user" className="quick-button" pullRight>
          <DropdownToggle bsRole="toggle">
            <i className="ion-more" />
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem href={FlowRouter.path('segments/list')}>
              Manage segments
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>

        {
          FlowRouter.getQueryParam('segment')
            ? (
              <a
                tabIndex={0}
                className="quick-button"
                onClick={() => { filter('segment', null); }}
              >
                <i className="ion-close-circled" />
              </a>
            )
            : null
        }
      </Section.QuickButtons>

      <ul className="filters">
        {
          segments.length
          ? segments.map(segment =>
            <li key={segment._id}>
              <a
                tabIndex={0}
                className={getActiveClass('segment', segment._id)}
                onClick={() => { filter('segment', segment._id); }}
              >
                {segment.name}
                <span className="counter">
                  {Counts.get(`customers.segment.${segment._id}`)}
                </span>
              </a>
            </li>,
          )
          : <EmptyState
            icon={<i className="ion-pie-graph" />}
            text="No segments"
            size="small"
          />
        }
      </ul>
    </Section>
  );
}

Segments.propTypes = propTypes;

export default Segments;
