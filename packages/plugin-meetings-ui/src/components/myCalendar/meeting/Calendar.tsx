import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

type Props = {
  events: any[];
};
const localizer = momentLocalizer(moment);

export const CalendarComponent = ({ events }: Props) => {
  console.log('calendarEvents', events);
  return (
    <div style={{ height: '80vh' }}>
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
