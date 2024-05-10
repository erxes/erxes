import {
  CustomRangeContainer,
  EndDateContainer,
  FilterContainer,
} from '@erxes/ui-forms/src/forms/styles';
import Box from '@erxes/ui/src/components/Box';
import React from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __, router } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  loading: boolean;
  emptyText?: string;
  queryParams: any;
}

function DateFilters(props: IProps) {
  const { loading, emptyText } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const onRemove = () => {
    router.removeParams(navigate, location, 'startDate');
    router.removeParams(navigate, location, 'endDate');
  };

  const extraButtons = (
    // <>
    //   {router.getParam(history, 'startDate') && (
    //     <a href="#" tabIndex={0} onClick={onRemove}>
    //       <Icon icon="times-circle" />
    //     </a>
    //   )}
    // </>

    <>
      {(router.getParam(location, 'startDate') ||
        router.getParam(location, 'endDate')) && (
        <a href="#" tabIndex={0} onClick={onRemove}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  const onChangeRangeFilter = (key: string, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';

    router.setParams(navigate, location, { [key]: formattedDate });
  };

  const data = (
    <FilterContainer>
      <React.Fragment>
        <ControlLabel>Start Date</ControlLabel>

        <CustomRangeContainer id="CustomRangeContainer">
          <DateControl
            value={router.getParam(location, 'startDate') || ''}
            required={false}
            name="startDate"
            onChange={(date) => onChangeRangeFilter('startDate', date)}
            placeholder={'Start date'}
            dateFormat={'YYYY-MM-DD'}
          />

          <EndDateContainer>
            <DateControl
              value={router.getParam(location, 'endDate') || ''}
              required={false}
              name="endDate"
              placeholder={'End date'}
              onChange={(date) => onChangeRangeFilter(`endDate`, date)}
              dateFormat={'YYYY-MM-DD'}
            />
          </EndDateContainer>
        </CustomRangeContainer>
      </React.Fragment>
    </FilterContainer>
  );

  return (
    <Box
      title={__('Filter by date')}
      collapsible={false}
      extraButtons={extraButtons}
      name="dateFilters"
      isOpen={true}
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={1}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default DateFilters;
