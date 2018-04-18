import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import {
  DropdownToggle,
  Icon,
  DataWithLoader
} from 'modules/common/components';
import { router } from 'modules/common/utils';

const propTypes = {
  history: PropTypes.object,
  contentType: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Segments({ history, contentType, counts, segments, loading }, { __ }) {
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
              icon="piechart"
              size={10}
              style={{
                color: segment.color,
                marginRight: '5px'
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
      <Header spaceBottom uppercase>
        {__('Filter by segments')}
      </Header>

      <Section.QuickButtons>
        <Dropdown
          id="dropdown-user"
          className="quick-button"
          pullRight
          style={{ verticalAlign: 'top', float: 'left' }}
        >
          <DropdownToggle bsRole="toggle">
            <a>
              <Icon icon="settings" />
            </a>
          </DropdownToggle>
          <Dropdown.Menu>
            <MenuItem
              onClick={() => history.push(`/segments/new/${contentType}`)}
            >
              {__('New segment')}
            </MenuItem>
            <MenuItem onClick={() => history.push(`/segments/${contentType}`)}>
              {__('Manage segments')}
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>

        {router.getParam(history, 'segment') ? (
          <a
            tabIndex={0}
            onClick={() => {
              router.setParams(history, { segment: null });
            }}
          >
            <Icon icon="cancel-1" />
          </a>
        ) : null}
      </Section.QuickButtons>

      <DataWithLoader
        data={data}
        loading={loading}
        count={segments.length}
        emptyText="No segments"
        emptyIcon="pie-graph"
        size="small"
        objective={true}
      />
    </Section>
  );
}

Segments.propTypes = propTypes;
Segments.contextTypes = {
  __: PropTypes.func
};

export default withRouter(Segments);
