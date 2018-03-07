import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { router } from 'modules/common/utils';
import { statusFilters } from 'modules/engage/constants';

function Status({ history, counts }, { __ }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>{__('Status')}</Section.Title>

      <SidebarList>
        {statusFilters.map((status, index) => (
          <li key={index}>
            <Link
              tabIndex={0}
              className={
                router.getParam(history, 'status') === status.key
                  ? 'active'
                  : ''
              }
              to={`/engage?status=${status.key}`}
            >
              {__(status.value)}
              <SidebarCounter>{counts[status.key]}</SidebarCounter>
            </Link>
          </li>
        ))}
      </SidebarList>
    </Section>
  );
}

Status.propTypes = {
  history: PropTypes.object,
  counts: PropTypes.object
};

Status.contextTypes = {
  __: PropTypes.func
};

export default withRouter(Status);
