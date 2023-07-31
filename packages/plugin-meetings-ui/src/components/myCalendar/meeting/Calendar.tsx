import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

type Props = {
  events: any[];
};
const localizer = momentLocalizer(moment);

export const CalendarComponent = ({ events }: Props) => {
  return (
    <div style={{ height: '800px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week']}
      />
    </div>
  );
};
