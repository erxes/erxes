import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { router } from 'modules/common/utils';
import { statusFilters } from 'modules/engage/constants';

function Status({ history, counts }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>Status</Section.Title>

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
              {status.value}
              <span>{counts[status.key]}</span>
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

export default withRouter(Status);
