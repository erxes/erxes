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
import { DropdownToggle, Icon, ShowData } from 'modules/common/components';
import { router } from 'modules/common/utils';

const propTypes = {
  history: PropTypes.object,
  contentType: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Segments({ history, contentType, counts, segments, loading }) {
  const { Section, Header } = Wrapper.Sidebar;

  const orderedSegments = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      orderedSegments.push(segment, ...segment.getSubSegments);
    }
  });

  const data = (
    <SidebarList>
      {orderedSegments.map(segment => (
        <li
          key={segment._id}
          className={segment.subOf ? 'child-segment' : null}
        >
          <a
            tabIndex={0}
            className={
              router.getParam(history, 'segment') === segment._id
                ? 'active'
                : ''
            }
            onClick={() => {
              router.setParams(history, { segment: segment._id });
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
            />{' '}
            {segment.name}
            <SidebarCounter>{counts[segment._id]}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Section>
      <Header spaceBottom>Filter by segments</Header>

      <Section.QuickButtons>
        <Dropdown
          id="dropdown-user"
          className="quick-button"
          pullRight
          style={{ verticalAlign: 'top' }}
        >
          <DropdownToggle bsRole="toggle">
            <Icon icon="gear-a" />
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

        {router.getParam(history, 'segment') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              router.setParams(history, { segment: null });
            }}
          >
            <Icon icon="close-circled" />
          </QuickButton>
        ) : null}
      </Section.QuickButtons>

      <ShowData
        data={data}
        loading={loading}
        count={segments.length}
        emptyText="no segments"
        emptyIcon="pie-graph"
        size="small"
        objective={true}
      />
    </Section>
  );
}

Segments.propTypes = propTypes;

export default withRouter(Segments);
