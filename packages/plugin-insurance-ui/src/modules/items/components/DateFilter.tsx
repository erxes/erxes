import {
    CustomRangeContainer,
    EndDateContainer,
    FilterContainer,
} from '@erxes/ui-forms/src/forms/styles';
import Box from '@erxes/ui/src/components/Box';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __, router } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  loading: boolean;
  emptyText?: string;
  queryParams: any;
}

function DateFilters(props: IProps) {
  const { history, loading, emptyText } = props;

  const onRemove = () => {
    router.removeParams(history, 'startDate');
    router.removeParams(history, 'endDate');
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
      {(router.getParam(history, 'startDate') ||
        router.getParam(history, 'endDate')) && (
        <a href="#" tabIndex={0} onClick={onRemove}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  const onChangeRangeFilter = (key: string, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';

    router.setParams(history, { [key]: formattedDate });
  };

  const data = (
    <FilterContainer>
      <React.Fragment>
        <ControlLabel>Start Date</ControlLabel>

        <CustomRangeContainer id="CustomRangeContainer">
          <DateControl
            value={router.getParam(history, 'startDate') || ''}
            required={false}
            name="startDate"
            onChange={(date) => onChangeRangeFilter('startDate', date)}
            placeholder={'Start date'}
            dateFormat={'YYYY-MM-DD'}
          />

          <EndDateContainer>
            <DateControl
              value={router.getParam(history, 'endDate') || ''}
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

export default withRouter<IProps>(DateFilters);
