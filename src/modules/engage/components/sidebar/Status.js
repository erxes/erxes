import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { router } from 'modules/common/utils';
import { statusFilters } from 'modules/engage/constants';

function Status({ history, counts }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>Status</Section.Title>

      <ul className="sidebar-list">
        {statusFilters.map((status, index) => (
          <li key={index}>
            <a
              tabIndex={0}
              className={
                router.getParam(history, 'status') === status.key
                  ? 'active'
                  : ''
              }
              onClick={() => {
                router.setParams(history, { status: status.key });
              }}
            >
              {status.value}
              <span className="counter">{counts[status.key]}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

Status.propTypes = {
  history: PropTypes.object,
  counts: PropTypes.object
};

export default withRouter(Status);
