import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Icon from '@erxes/ui/src/components/Icon';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

import { DateInputContainer } from '../styles';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  fields: any[];
  loading: boolean;
  emptyText?: string;
}

function DateFilters(props: IProps) {
  const { history, counts, fields, loading, emptyText } = props;
  const [filterParams, setFilterParams] = useState({});

  const onRemove = () => {
    router.setParams(history, { dateFilters: null });
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
    for (const key of Object.keys(filterParams)) {
      router.setParams(history, { dateFilters: JSON.stringify(filterParams) });
    }
    router.removeParams(history, 'page');
  };

  const data = (
    <>
      <SidebarList>
        {fields.map(field => {
          return (
            <li key={field.name}>
              <FieldStyle>{field.label}</FieldStyle>

              <DateInputContainer>
                <DateControl
                  value={
                    (filterParams[`${field.name}`] &&
                      filterParams[`${field.name}`]['gte']) ||
                    ''
                  }
                  required={false}
                  name="startDate"
                  placeholder={'Start date'}
                  onChange={date =>
                    onChangeRangeFilter(`${field.name}`, 'gte', date)
                  }
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
              </DateInputContainer>
            </li>
          );
        })}
      </SidebarList>

      <Button
        block={true}
        btnStyle="success"
        uppercase={false}
        onClick={onChangeFilters}
        icon="filter"
      >
        {__('Filter')}
      </Button>
    </>
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
