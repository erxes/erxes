import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Histories from '../../containers/Histories';
import { IAutomation, ITrigger } from '../../types';
import { FilterDateItem, FilterWrapper, HistoriesWrapper } from './styles';

type Props = {
  automation: IAutomation;
  triggersConst: ITrigger[];
  actionsConst: any[];
  queryParams: any;
};

type State = {
  page?: number;
  perPage?: number;
  status?: string;
  triggerId?: string;
  triggerType?: string;
  beginDate?: Date;
  endDate?: Date;
};

export default function HistoriesContainer(props: Props) {
  const { automation, triggersConst, queryParams } = props;

  const [filterParams, setFilterParams] = useState<State>({
    page: 1,
    perPage: 13
  });

  useEffect(() => {
    if (filterParams.page !== queryParams?.page) {
      setFilterParams({ ...filterParams, page: parseInt(queryParams.page) });
    }
  }, [queryParams?.page]);

  const onSelect = (
    name: string,
    selectedItem: string & { value: string; label?: string }
  ) => {
    const value = selectedItem ? selectedItem.value : '';

    setFilterParams({ [name]: value } as unknown as Pick<State, keyof State>);
  };

  const onDateChange = (type: string, date) => {
    const filter = { ...filterParams };

    if (date) {
      filter[type] = dayjs(date).format('YYYY-MM-DD HH:mm');
    } else {
      filter.beginDate = undefined;
      filter.endDate = undefined;
    }

    setFilterParams(filter);
  };

  const renderDateFilter = (key: string, name: string) => {
    const props = {
      value: filterParams[key],
      inputProps: {
        placeholder: `${__(`Filter by ${__(name)}`)}`
      }
    };

    return (
      <FilterDateItem>
        <div className="icon-option">
          <Icon icon="calendar-alt" />
          <Datetime
            {...props}
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            onChange={onDateChange.bind(this, key)}
            closeOnSelect={true}
          />
        </div>
      </FilterDateItem>
    );
  };

  const { status, triggerId, triggerType } = filterParams;

  const triggerOptions = [
    ...automation.triggers.map(t => ({
      value: t.id,
      label: t.label
    }))
  ];
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'error', label: 'Error' },
    { value: 'missed', label: 'Missed' },
    { value: 'complete', label: 'Complete' }
  ];
  const triggerTypeOptions = [
    ...triggersConst.map(t => ({
      value: t.type,
      label: t.label
    }))
  ];

  return (
    <HistoriesWrapper>
      <FilterWrapper>
        {renderDateFilter('beginDate', 'Begin Date')}
        {renderDateFilter('endDate', 'End Date')}
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="checked-1" />
            <Select
              placeholder={__('Filter by Status')}
              isClearable={true}
              value={statusOptions.find(o => o.value === status)}
              options={statusOptions}
              onChange={onSelect.bind(this, 'status')}
            />
          </div>
        </FilterDateItem>
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="swatchbook" />
            <Select
              placeholder={__('Filter by Trigger')}
              isClearable={true}
              value={triggerOptions.find(o => o.value === triggerId)}
              options={triggerOptions}
              onChange={onSelect.bind(this, 'triggerId')}
            />
          </div>
        </FilterDateItem>
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="cell" />
            <Select
              placeholder={__('Filter by Trigger Type')}
              isClearable={true}
              value={triggerTypeOptions.find(o => o.value === triggerType)}
              options={triggerTypeOptions}
              onChange={onSelect.bind(this, 'triggerType')}
            />
          </div>
        </FilterDateItem>
      </FilterWrapper>
      <Histories {...props} filterParams={filterParams} />
    </HistoriesWrapper>
  );
}
