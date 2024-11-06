import React, { useState, useRef } from 'react'
import DateTime from "@nateradebaugh/react-datetime";
import dayjs from "dayjs";
import { DateRangeWrapper, Divider } from "../../styles";

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const dateFormat = "MM/DD/YYYY";

export type DateRangeType = {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

type Props = {
  dateRange: any;
  onChange: (selectedDate: any) => void;
}

const DateRange = (props: Props) => {

  const { dateRange, onChange } = props

  const startDateRef = useRef<DateTime | null>(null);
  const endDateRef = useRef<DateTime | null>(null);

  const [viewDate, setViewDate] = useState<DateRangeType>({
    startDate: dayjs().toDate(),
    endDate: dayjs().add(1, 'month').toDate(),
  });

  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const renderDay = (dateTimeProps, currentDate) => {
    let isSelected = false;
    let isHovered = false;
    let isInRange = false;
    const currDay = dayjs(new Date(currentDate));

    const { startDate, endDate } = dateRange;
    const rangeStart = startDate && dayjs(startDate);
    const rangeEnd = endDate && dayjs(endDate);

    if (
      (rangeStart && currDay.isSame(rangeStart, 'day')) ||
      (rangeEnd && currDay.isSame(rangeEnd, 'day'))
    ) {
      isSelected = true;
    }

    if (rangeStart && rangeEnd) {
      isInRange = currDay.isAfter(rangeStart, 'day') && currDay.isBefore(rangeEnd, 'day');
    }

    if (hoveredDate && rangeStart && !rangeEnd) {
      const start = rangeStart.isBefore(hoveredDate) ? rangeStart : hoveredDate;
      const end = rangeStart.isBefore(hoveredDate) ? hoveredDate : rangeStart;
      isHovered = currDay.isSameOrAfter(start, 'day') && currDay.isSameOrBefore(end, 'day');
    }

    // Combine classes
    const classes = [
      'rdtDay',
      isSelected && 'rdtActive',
      isInRange && 'rdtInRange',
      isHovered && 'rdtHover',
      rangeStart && currDay.isSame(rangeStart, 'day') && 'rdtStart',
      rangeEnd && currDay.isSame(rangeEnd, 'day') && 'rdtEnd',
    ].filter(Boolean).join(' ');

    return (
      <td
        {...dateTimeProps}
        className={classes}
        onMouseEnter={() => setHoveredDate(currDay.toDate())}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {currDay.date()}
      </td>
    );
  };

  const handleNavigateBack = (amount, type, dateType) => {
    const { startDate, endDate } = viewDate

    if (startDate && dateType === 'endDate' && type === 'months') {

      const newDate = dayjs(endDate).subtract(amount, type);
      const isValid = newDate.isBefore(startDate, 'month') || newDate.isSame(startDate, 'month');

      if (isValid) {
        setViewDate({
          endDate: newDate.toDate(),
          startDate: dayjs(newDate).subtract(1, 'month').toDate()
        });

        return;
      }
    }

    const newDate = dayjs(viewDate[dateType]).subtract(amount, type);

    setViewDate(prevState => ({
      ...prevState,
      [dateType]: newDate
    }));
  };

  const handleNavigateForward = (amount, type, dateType) => {
    const { startDate, endDate } = viewDate

    if (endDate && dateType === 'startDate' && type === 'months') {

      const newDate = dayjs(startDate).add(amount, type);
      const isValid = newDate.isAfter(endDate, 'month') || newDate.isSame(endDate, 'month');

      if (isValid) {
        setViewDate({
          startDate: newDate.toDate(),
          endDate: dayjs(newDate).add(1, 'month').toDate()
        });

        return;
      }
    }

    const newDate = dayjs(viewDate[dateType]).add(amount, type);

    setViewDate(prevState => ({
      ...prevState,
      [dateType]: newDate
    }));
  };

  const handleViewModeChange = (viewMode: string, dateType: string) => {
    if (startDateRef.current && dateType === 'startDate') {
      setTimeout(() => {
        const currentViewDate = dayjs(startDateRef.current!.state.viewDate);

        if (viewDate.endDate) {
          const isValid =
            currentViewDate.isAfter(dayjs(viewDate.endDate), 'month') ||
            currentViewDate.isSame(dayjs(viewDate.endDate), 'month');

          if (isValid) {
            setViewDate({
              endDate: dayjs(currentViewDate).add(1, 'month').toDate(),
              startDate: currentViewDate.toDate(),
            });
          } else {
            setViewDate((prevState) => ({
              ...prevState,
              startDate: currentViewDate.toDate(),
            }));
          }
        }
      }, 0);
    }

    if (endDateRef.current && dateType === 'endDate') {
      setTimeout(() => {
        const currentViewDate = dayjs(endDateRef.current!.state.viewDate);

        if (viewDate.startDate) {
          const isValid =
            currentViewDate.isBefore(dayjs(viewDate.startDate), 'month') ||
            currentViewDate.isSame(dayjs(viewDate.startDate), 'month');

          if (isValid) {
            setViewDate({
              endDate: currentViewDate.toDate(),
              startDate: dayjs(currentViewDate).subtract(1, 'month').toDate(),
            });
          } else {
            setViewDate((prevState) => ({
              ...prevState,
              endDate: currentViewDate.toDate(),
            }));
          }
        }
      }, 0);
    }
  };

  return (
    <DateRangeWrapper>
      <DateTime
        ref={startDateRef}
        onChange={onChange}
        input={false}
        renderDay={renderDay}
        viewDate={viewDate.startDate}
        timeFormat={false}
        onNavigateBack={(amount, type) => handleNavigateBack(amount, type, 'startDate')}
        onNavigateForward={(amount, type) => handleNavigateForward(amount, type, 'startDate')}
        onViewModeChange={(viewMode) => handleViewModeChange(viewMode, 'startDate')}
      />
      <Divider />
      <DateTime
        ref={endDateRef}
        onChange={onChange}
        input={false}
        renderDay={renderDay}
        viewDate={viewDate.endDate}
        timeFormat={false}
        onNavigateBack={(amount, type) => handleNavigateBack(amount, type, 'endDate')}
        onNavigateForward={(amount, type) => handleNavigateForward(amount, type, 'endDate')}
        onViewModeChange={(viewMode) => handleViewModeChange(viewMode, 'endDate')}
      />
    </DateRangeWrapper>
  )
}

export default DateRange