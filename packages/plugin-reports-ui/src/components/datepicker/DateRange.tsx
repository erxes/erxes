import * as dayjs from "dayjs";

import { Alert, __ } from "@erxes/ui/src/utils";
import { FlexCenter, FlexRow, MarginY } from "../../styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import Datetime from "@nateradebaugh/react-datetime";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import { PopoverButton } from "@erxes/ui/src/styles/main";

const dateFormat = "MM/DD/YYYY";
const NOW = new Date();
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

type Props = {
  startDate?: Date;
  endDate?: Date;
  showTime?: boolean;
  onSaveButton: (dateRange: DateRange) => void;
};

const DateRange = (props: Props) => {
  const { showTime, onSaveButton, startDate, endDate } = props;

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startDate || dayjs(NOW).add(-7, "day").toDate(),
    endDate: endDate || NOW,
  });

  let overlayTrigger;
  const closePopover = () => {
    if (overlayTrigger) {
      overlayTrigger.hide();
    }
  };

  const onSaveDateButton = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      Alert.error("Please select start date and end date");
      return;
    }

    onSaveButton(dateRange);
    closePopover();
  };

  const handleDateChange = (selectedDate: any) => {
    if (!selectedDate) {
      return;
    }

    const newDateRange: DateRange = { ...dateRange };

    if (!newDateRange.startDate) {
      newDateRange.startDate = selectedDate;
    } else if (!newDateRange.endDate) {
      // start range over when clicks on date earlier than start date
      if (dayjs(selectedDate) < dayjs(newDateRange.startDate)) {
        newDateRange.startDate = selectedDate;
        newDateRange.endDate = null;
      } else {
        newDateRange.endDate = selectedDate;
      }
    } else {
      newDateRange.startDate = selectedDate;
      newDateRange.endDate = null;
    }

    setDateRange(newDateRange);
  };

  const renderDay = (dateTimeProps: any, currentDate) => {
    let isSelected = false;
    const currDay = dayjs(new Date(currentDate));
    const { startDate, endDate } = dateRange;
    const rangeStart = startDate && dayjs(startDate);
    const rangeEnd = endDate && dayjs(endDate);

    if (
      (rangeStart &&
        rangeEnd &&
        currDay >= rangeStart &&
        currDay <= rangeEnd) ||
      (rangeStart &&
        currDay.format(dateFormat) === rangeStart.format(dateFormat)) ||
      (rangeEnd &&
        dayjs(currDay).format(dateFormat) === rangeEnd.format(dateFormat))
    ) {
      isSelected = true;
    }

    return (
      <td
        {...dateTimeProps}
        className={`rdtDay ${isSelected ? "rdtActive" : ""}`}
      >
        {new Date(currentDate).getDate()}
      </td>
    );
  };

  const displayDate = () => {
    const { startDate, endDate } = dateRange;

    if (startDate && endDate) {
      return `${dayjs(startDate).format(dateFormat)} ~ ${dayjs(endDate).format(
        dateFormat
      )}`;
    }
    return __("Select a date");
  };
  return (
    <FlexRow>
      <Popover
        innerRef={overlayTrigger}
        trigger={
          <PopoverButton>
            <Button btnStyle="primary">{__("Date Range")}</Button>
          </PopoverButton>
        }
        placement="top-start"
      >
        <FlexRow style={{ justifyContent: "center", margin: "20px auto" }}>
          <Datetime
            {...props}
            renderDay={renderDay}
            input={false}
            timeFormat={showTime ? "HH:mm" : false}
            onChange={handleDateChange}
          />
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
      {displayDate()}
    </FlexRow>
  );
};

export default DateRange;
