import React from 'react';
import Popover from 'react-bootstrap/Popover';
import { PopoverButton } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FlexRow, DateName, FlexCenter } from '../../styles';
import Datetime from '@nateradebaugh/react-datetime';

type Props = {
  startDate: Date;
  endDate: Date;
  onChangeStart: (startDate: Date) => void;
  onChangeEnd: (endDate: Date) => void;
  onSaveButton: () => void;
};

const DateRange = (props: Props) => {
  const {
    startDate,
    endDate,
    onChangeEnd,
    onChangeStart,
    onSaveButton
  } = props;

  const onDateEndChange = (date: Date) => {
    onChangeEnd(date);
  };

  const onDateStartChange = (date: Date) => {
    onChangeStart(date);
  };
  const onSaveDateButton = () => {
    onSaveButton();
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
              input={false}
              value={startDate}
              onChange={onDateStartChange}
            />
          </div>

          <div>
            <DateName>End Date</DateName>
            <Datetime
              {...props}
              input={false}
              value={endDate}
              onChange={onDateEndChange}
            />
          </div>
        </FlexRow>

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
      </Popover>
    );
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-start"
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
