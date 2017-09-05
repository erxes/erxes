import React, { PropTypes } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import { statusFilters } from '/imports/api/engage/constants';

function Status({ counts }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>Status</Section.Title>

      <ul className="sidebar-list">
        {statusFilters.map((status, index) => (
          <li key={index}>
            <a
              tabIndex={0}
              className={getActiveClass('status', status.key)}
              onClick={() => {
                filter('status', status.key);
              }}
            >
              {status.value}
              <span className="counter">
                {counts[status.key]}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

Status.propTypes = {
  counts: PropTypes.object,
};

export default Status;
