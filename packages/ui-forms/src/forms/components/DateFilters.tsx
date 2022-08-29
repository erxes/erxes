import { CustomRangeContainer, FilterContainer } from '../styles';
import React, { useEffect, useState } from 'react';
import { __, router } from '@erxes/ui/src/utils/core';

import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { IRouterProps } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  fields: any[];
  loading: boolean;
  emptyText?: string;
}

function DateFilters(props: IProps) {
  const { history, fields, loading, emptyText } = props;

  const { dateFilters = '{}' } = queryString.parse(props.location.search);

  const [filterParams, setFilterParams] = useState(JSON.parse(dateFilters));

  useEffect(() => {
    setFilterParams(JSON.parse(dateFilters));
  }, [dateFilters]);

  const onRemove = () => {
    router.removeParams(history, 'dateFilters');
  };

  const extraButtons = (
    <>
      {router.getParam(history, 'dateFilters') && (
        <a href="#" tabIndex={0} onClick={onRemove}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  const onChangeRangeFilter = (key: string, op: 'gte' | 'lte', date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';

    const value: any = (filterParams[key] && filterParams[key]) || {
      gte: '',
      lte: ''
    };

    value[op] = formattedDate;

    filterParams[key] = { ...value };

    setFilterParams({ ...filterParams });
  };

  const onChangeFilters = () => {
    router.setParams(history, { dateFilters: JSON.stringify(filterParams) });

    router.removeParams(history, 'page');
  };

  const data = (
    <FilterContainer>
      {fields.map(field => {
        return (
          <React.Fragment key={field._id}>
            <ControlLabel>{field.label} range:</ControlLabel>

            <CustomRangeContainer id="CustomRangeContainer">
              <DateControl
                value={
                  (filterParams[`${field.name}`] &&
                    filterParams[`${field.name}`]['gte']) ||
                  ''
                }
                required={false}
                name="startDate"
                onChange={date =>
                  onChangeRangeFilter(`${field.name}`, 'gte', date)
                }
                placeholder={'Start date'}
                dateFormat={'YYYY-MM-DD'}
              />

              <DateControl
                value={
                  (filterParams[`${field.name}`] &&
                    filterParams[`${field.name}`]['lte']) ||
                  ''
                }
                required={false}
                name="endDate"
                placeholder={'End date'}
                onChange={date =>
                  onChangeRangeFilter(`${field.name}`, 'lte', date)
                }
                dateFormat={'YYYY-MM-DD'}
              />
            </CustomRangeContainer>
          </React.Fragment>
        );
      })}
      <Button
        block={true}
        btnStyle="success"
        uppercase={false}
        onClick={onChangeFilters}
        icon="filter"
      >
        {__('Filter')}
      </Button>
    </FilterContainer>
  );

  return (
    <Box
      title={__('Filter by date')}
      collapsible={fields.length > 5}
      extraButtons={extraButtons}
      name="showFilterByBrand"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={fields.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(DateFilters);
