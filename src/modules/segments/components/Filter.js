import React from 'react';
import { withRouter } from 'react-router';
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
  history: PropTypes.object,
  contentType: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired
};

function Segments({ history, contentType, counts, segments }) {
  const { Section, filter, getActiveClass, Header } = Wrapper.Sidebar;

  const orderedSegments = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      orderedSegments.push(segment, ...segment.getSubSegments);
    }
  });

  return (
    <Section>
      <Header>Filter by segments</Header>

      <Section.QuickButtons>
        <Dropdown id="dropdown-user" className="quick-button" pullRight>
          <DropdownToggle bsRole="toggle">
            <Icon icon="more" />
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem
              onClick={() => history.push(`/segments/new/${contentType}`)}
            >
              New segment
            </MenuItem>
            <MenuItem onClick={() => history.push(`/segments/${contentType}`)}>
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
            <li
              key={segment._id}
              className={segment.subOf ? 'child-segment' : null}
            >
              <a
                tabIndex={0}
                className={getActiveClass('segment', segment._id)}
                onClick={() => {
                  filter('segment', segment._id);
                }}
              >
                {segment.subOf ? '\u00a0\u00a0' : null}
                <Icon
                  icon="ios-circle-filled"
                  size={10}
                  style={{
                    color: segment.color,
                    marginRight: '10px'
                  }}
                />
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

export default withRouter(Segments);
