import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import React from 'react';

import { ITrip } from '../../../types';

type Props = {
  trip: ITrip;
};

const TripSection = (props: Props) => {
  const { Section } = Sidebar;
  const { trip } = props;

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  const duration = trip.route ? trip.route.summary.totalDuration : undefined;

  let durationText = 'NA';
  if (duration) {
    durationText = `${Math.floor(duration / 60)}H:${duration % 60}m`;
  }

  return (
    <Sidebar.Section>
      <Section>
        <SidebarList className="no-link">
          {renderRow('Status', trip.status || 'open')}
          {renderRow('Total duration', durationText)}
          {renderRow(
            'Total distance',
            `${trip.route ? trip.route.summary.totalDistance : 'null'} km`
          )}
          {renderRow('Created date', trip.createdAt)}
          {renderRow('Start date', trip.startedDate || 'NA')}
          {renderRow('ETA', trip.estimatedCloseDate || 'NA')}
        </SidebarList>
      </Section>
    </Sidebar.Section>
  );
};

export default TripSection;
