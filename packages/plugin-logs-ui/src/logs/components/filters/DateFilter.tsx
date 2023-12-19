import { __, router } from 'coreui/utils';
import React from 'react';
import dayjs from 'dayjs';
import { DateContainer } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { EndDateContainer } from '@erxes/ui-forms/src/forms/styles';
import Datetime from '@nateradebaugh/react-datetime';
import Box from '@erxes/ui/src/components/Box';
import { CustomRangeContainer, FilterContainer } from '../../styles';

type Props = {
  history: any;
  queryParams: any;
};

function DateFilter({ history, queryParams }: Props) {
  const onChangeRangeFilter = (kind, date) => {
    if (dayjs(date).isValid()) {
      const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');

      router.setParams(history, { [kind]: cDate });
      router.removeParams(history, 'page');
    }
  };

  return (
    <Box
      title={__('Filter by Date')}
      name="showFilterByDate"
      isOpen={queryParams.startDate || queryParams.endDate}
    >
      <FilterContainer>
        <ControlLabel>{`Created Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __('Start Date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={queryParams.startDate || ''}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(this, 'startDate')}
              viewMode={'days'}
              className={'filterDate'}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                inputProps={{ placeholder: __('End Date') }}
                dateFormat="YYYY-MM-DD"
                timeFormat="HH:mm"
                value={queryParams.endDate || ''}
                closeOnSelect={true}
                utc={true}
                input={true}
                onChange={onChangeRangeFilter.bind(this, 'endDate')}
                viewMode={'days'}
                className={'filterDate'}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FilterContainer>
    </Box>
  );
}

export default DateFilter;
