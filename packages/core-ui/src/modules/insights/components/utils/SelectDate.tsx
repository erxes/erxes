import { ControlLabel } from '@erxes/ui/src/components/form'
import React, { useEffect, useState } from "react";
import { FlexRow, MarginY } from "../../styles";
import Select from "react-select";
import Button from "@erxes/ui/src/components/Button";
import Popover from "@erxes/ui/src/components/Popover";
import { PopoverButton } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/index";
import dayjs from "dayjs";
import DateRange, { type DateRangeType } from './DateRange';

const dateFormat = "MM/DD/YYYY";
const NOW = new Date();
interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

type Props = {
    fieldLabel: string;
    fieldValue: any;
    fieldOptions: any[];
    onSelect: (selectedOption: any) => void;
    startDate?: Date;
    endDate?: Date;
    onSaveButton: (dateRange: DateRangeType) => void;
}

const SelectDate = (props: Props) => {

    const {
        fieldLabel,
        fieldValue,
        fieldOptions,
        onSelect,
        startDate,
        endDate,
        onSaveButton
    } = props

    const [options, setOptions] = useState(fieldOptions || [])

    const [dateRange, setDateRange] = useState<DateRangeType>({
        startDate: startDate || dayjs(NOW).add(-7, "day").startOf('day').toDate(),
        endDate: endDate || dayjs(NOW).endOf('day').toDate(),
    });

    useEffect(() => {
        const { startDate, endDate } = dateRange

        if (fieldValue !== 'customDate') {
            onSaveButton({} as DateRangeType)
            return;
        }

        setOptions((prevState) => {
            return prevState.map(option =>
                option.value === 'customDate'
                    ? {
                        value: 'customDate',
                        label: `
                  ${startDate ? dayjs(startDate).format(dateFormat) : ''}
                  ${endDate ? ' - ' + dayjs(endDate).format(dateFormat) : ''}
                `
                    }
                    : option
            );
        });

        onSaveButton(dateRange)
    }, [fieldValue, dateRange])

    const handleDateChange = (selectedDate: any,) => {
        if (!selectedDate) return;

        setDateRange((prevRange): DateRangeType => {
            const { startDate, endDate } = prevRange;

            if (!startDate || endDate) {
                return { startDate: dayjs(selectedDate).startOf('day').toDate(), endDate: undefined };
            }

            if (dayjs(selectedDate).isBefore(startDate)) {
                return { startDate: dayjs(selectedDate).startOf('day').toDate(), endDate: dayjs(startDate).endOf('day').toDate() };
            }

            return { ...prevRange, endDate: dayjs(selectedDate).endOf('day').toDate() };
        });
    };

    return (
        <div className="date-range">
            <ControlLabel>{fieldLabel}</ControlLabel>
            <FlexRow>
                <Select
                    value={options.find((o) => o.value === fieldValue)}
                    onChange={onSelect}
                    options={fieldOptions}
                    isClearable={true}
                    placeholder={fieldLabel}
                    menuPlacement="auto"
                />
                {fieldValue === "customDate" && (
                    <MarginY margin={15}>
                        <FlexRow>
                            <Popover
                                trigger={
                                    <PopoverButton>
                                        <Button btnStyle="primary" icon="calendar-alt" />
                                    </PopoverButton>
                                }
                                placement="top-start"
                                className='date-range-popover'
                            >
                                <DateRange
                                    dateRange={dateRange}
                                    onChange={handleDateChange}
                                />
                            </Popover>
                        </FlexRow>
                    </MarginY>
                )}
            </FlexRow>
        </div>
    )
}

export default SelectDate