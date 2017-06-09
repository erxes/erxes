import React from 'react';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Wrapper } from '/imports/react-ui/layout/components';
import { statusFilters } from '/imports/api/engage/constants';

function Status() {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>Status</Section.Title>

      <ul className="filters">
        {statusFilters.map((status, index) =>
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
                {Counts.get(`engage.messages.status.${status.key}`)}
              </span>
            </a>
          </li>,
        )}
      </ul>
    </Section>
  );
}

export default Status;
