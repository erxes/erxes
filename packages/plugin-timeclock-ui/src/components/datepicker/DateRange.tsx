import React from 'react';
import Popover from 'react-bootstrap/Popover';
import { PopoverButton } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FlexRow, DateName, FlexCenter, MarginY } from '../../styles';
import Datetime from '@nateradebaugh/react-datetime';
import * as dayjs from 'dayjs';
import { dateFormat } from '../../constants';

type Props = {
  startDate: Date;
  endDate: Date;
  showTime?: boolean;
  onChangeStart: (startDate: Date) => void;
  onChangeEnd: (endDate: Date) => void;
  onSaveButton: () => void;
};

const DateRange = (props: Props) => {
  const {
    startDate,
    endDate,
    showTime,
    onChangeEnd,
    onChangeStart,
    onSaveButton
  } = props;

  let overlayTrigger;
  const closePopover = () => {
    if (overlayTrigger) {
      overlayTrigger.hide();
    }
  };

  const onDateEndChange = date => {
    onChangeEnd(date);
  };

  const onDateStartChange = date => {
    onChangeStart(date);
  };
  const onSaveDateButton = () => {
    onSaveButton();
    closePopover();
  };

  const renderDay = (dateTimeProps: any, currentDate) => {
    let isSelected = false;
    const currDay = new Date(currentDate);
    if (currDay >= startDate && currDay <= endDate) {
      isSelected = true;
    }

    if (
      dayjs(currDay).format(dateFormat) === dayjs(startDate).format(dateFormat)
    ) {
      return (
        <td
          {...dateTimeProps}
          className={`rdtDay`}
          style={{ backgroundColor: '#B1A5F1', borderRadius: '8px' }}
        >
          {new Date(currentDate).getDate()}
        </td>
      );
    }

    if (
      dayjs(currDay).format(dateFormat) === dayjs(endDate).format(dateFormat)
    ) {
      return (
        <td
          {...dateTimeProps}
          className={`rdtDay`}
          style={{ backgroundColor: '#947FFC', borderRadius: '8px' }}
        >
          {new Date(currentDate).getDate()}
        </td>
      );
    }

    return (
      <td
        {...dateTimeProps}
        className={`rdtDay ${isSelected ? 'rdtActive' : ''}`}
      >
        {new Date(currentDate).getDate()}
      </td>
    );
  };

  const renderPopover = () => {
    return (
      <Popover id="date-popover" content={true}>
        <Popover.Title as="h3">{__('Filter by date')}</Popover.Title>
        <FlexRow>
          <div>
            <DateName>Start Date</DateName>
            <Datetime
              {...props}
              renderDay={renderDay}
              input={false}
              timeFormat={showTime ? 'HH:mm' : false}
              value={startDate}
              onChange={onDateStartChange}
            />
          </div>

          <div>
            <DateName>End Date</DateName>
            <Datetime
              {...props}
              renderDay={renderDay}
              timeFormat={showTime ? 'HH:mm' : false}
              input={false}
              value={endDate}
              onChange={onDateEndChange}
            />
          </div>
        </FlexRow>
        <MarginY margin={10}>
          <FlexCenter>
            <Button
              btnStyle="warning"
              onClick={onSaveDateButton}
              icon="filter-1"
              size="small"
            >
              Save
            </Button>
          </FlexCenter>
        </MarginY>
      </Popover>
    );
  };

  return (
    <OverlayTrigger
      ref={overLay => (overlayTrigger = overLay)}
      trigger="click"
      placement="top-start"
      overlay={renderPopover()}
      container={this}
      rootClose={true}
    >
      <PopoverButton>
        {__('Select Date Range')}
        <Icon icon="angle-down" />
      </PopoverButton>
    </OverlayTrigger>
  );
};

export default DateRange;
