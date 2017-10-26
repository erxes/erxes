import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import {
  QuickButton,
  SidebarList,
  SidebarCounter
} from 'modules/layout/styles';
import { DropdownToggle, EmptyState, Icon } from 'modules/common/components';

const propTypes = {
  contentType: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired
};

function Segments({ contentType, counts, segments }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  const orderedSegments = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      orderedSegments.push(segment, ...segment.getSubSegments);
    }
  });

  return (
    <Section collapsible={segments.length > 5}>
      <Section.Title>Filter by segments</Section.Title>

      <Section.QuickButtons>
        <Dropdown id="dropdown-user" className="quick-button" pullRight>
          <DropdownToggle bsRole="toggle">
            <Icon icon="more" />
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem href={`/segments/new/${contentType}`}>
              New segment
            </MenuItem>
            <MenuItem href={`/segments/${contentType}`}>
              Manage segments
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>

        {window.location.search.includes('segment') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              filter('segment', null);
            }}
          >
            <Icon icon="close-circled" />
          </QuickButton>
        ) : null}
      </Section.QuickButtons>

      <SidebarList>
        {orderedSegments.length ? (
          orderedSegments.map(segment => (
            <li key={segment._id}>
              <a
                tabIndex={0}
                className={getActiveClass('segment', segment._id)}
                onClick={() => {
                  filter('segment', segment._id);
                }}
              >
                {segment.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
                <Icon icon="pie-graph icon" style={{ color: segment.color }} />
                {segment.name}
                <SidebarCounter>{counts[segment._id]}</SidebarCounter>
              </a>
            </li>
          ))
        ) : (
          <EmptyState icon="pie-graph" text="No segments" size="small" />
        )}
      </SidebarList>
    </Section>
  );
}

Segments.propTypes = propTypes;

export default Segments;
