import { ControlLabel, FormControl } from 'modules/common/components/form';
import Button from 'modules/common/components/Button';
import DateControl from 'modules/common/components/form/DateControl';
import { __ } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';
import ArchivedItems from '../containers/ArchivedItems';
import { HeaderButton } from '../styles/header';
import {
  ArchiveWrapper,
  TopBar,
  CustomRangeContainer,
  FilterBox
} from '../styles/rightMenu';
import { IOptions } from '../types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import Select from 'react-select-plus';
import SelectLabel from './label/SelectLabel';
import { PRIORITIES } from '../constants';
import SelectProducts from 'modules/settings/productService/containers/product/SelectProducts';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

type Props = {
  options: IOptions;
  queryParams: any;
};

const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));

function Archive(props: Props) {
  const [type, changeType] = useState('item');
  const [searchValue, setSearchValue] = useState('');
  const { options, queryParams } = props;

  const [searchInputValue, setSearchInputValue] = useState('');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const onChangeRangeFilter = (setterFn, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
    setterFn(formattedDate);
  };

  const switchType = (): string => (type === 'list' ? 'item' : 'list');

  const toggleType = () => changeType(switchType());

  const debouncedSetSearchValue = debounce(setSearchValue, 1000);

  useEffect(() => {
    debouncedSetSearchValue(searchInputValue);
  }, [searchInputValue]);

  const isFiltered = (): boolean => {
    if (type === 'item') {
      if (
        searchInputValue ||
        userIds.length ||
        priorities.length ||
        assignedUserIds.length ||
        labelIds.length ||
        productIds.length ||
        startDate ||
        endDate
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (searchInputValue) {
        return true;
      } else {
        return false;
      }
    }
  };

  const clearFilters = () => {
    setSearchInputValue('');
    setUserIds([]);
    setPriorities([]);
    setAssignedUserIds([]);
    setLabelIds([]);
    setProductIds([]);
    setStartDate('');
    setEndDate('');
  };

  const renderItemFilters = () => {
    return (
      <FilterBox>
        <SelectTeamMembers
          label="Filter by created members"
          name="userIds"
          onSelect={v => {
            if (typeof v === 'string') {
              if (!v) {
                setUserIds([]);
              } else {
                setUserIds([v]);
              }
            } else {
              setUserIds(v);
            }
          }}
        />
        <Select
          placeholder={__('Filter by priority')}
          value={priorities}
          options={priorityValues}
          name="priority"
          onChange={arr => setPriorities(arr.map(v => v.value))}
          multi={true}
          loadingPlaceholder={__('Loading...')}
        />

        <SelectTeamMembers
          label="Filter by team members"
          name="assignedUserIds"
          onSelect={v => {
            if (typeof v === 'string') {
              if (!v) {
                setAssignedUserIds([]);
              } else {
                setAssignedUserIds([v]);
              }
            } else {
              setAssignedUserIds(v);
            }
          }}
        />

        <SelectLabel
          name="labelIds"
          onSelect={v => {
            if (typeof v === 'string') {
              if (!v) {
                setLabelIds([]);
              } else {
                setLabelIds([v]);
              }
            } else {
              setLabelIds(v);
            }
          }}
          filterParams={{ pipelineId: queryParams.pipelineId || '' }}
          multi={true}
        />

        <SelectProducts
          label={__('Filter by products')}
          name="productIds"
          onSelect={v => {
            if (typeof v === 'string') {
              if (!v) {
                setProductIds([]);
              } else {
                setProductIds([v]);
              }
            } else {
              setProductIds(v);
            }
          }}
        />

        <ControlLabel>Close Date range:</ControlLabel>

        <CustomRangeContainer>
          <DateControl
            value={startDate}
            required={false}
            name="startDate"
            onChange={date => onChangeRangeFilter(setStartDate, date)}
            placeholder={'Start date'}
            dateFormat={'YYYY-MM-DD'}
          />

          <DateControl
            value={endDate}
            required={false}
            name="endDate"
            placeholder={'End date'}
            onChange={date => onChangeRangeFilter(setEndDate, date)}
            dateFormat={'YYYY-MM-DD'}
          />
        </CustomRangeContainer>
      </FilterBox>
    );
  };

  return (
    <ArchiveWrapper>
      <TopBar>
        <FormControl
          type="text"
          autoFocus={true}
          placeholder={`Search ${type}...`}
          value={searchInputValue}
          onChange={e =>
            setSearchInputValue((e.target as HTMLInputElement).value)
          }
        />
        <HeaderButton hasBackground={true} onClick={toggleType}>
          {__('Switch To')} {switchType()}
          {'s'}
        </HeaderButton>
      </TopBar>

      {type === 'item' && renderItemFilters()}

      {isFiltered() && (
        <Button
          block={true}
          btnStyle="warning"
          onClick={clearFilters}
          icon="times-circle"
          style={{ marginBottom: '20px' }}
        >
          {__('Clear Filter')}
        </Button>
      )}

      <ArchivedItems
        options={options}
        pipelineId={queryParams.pipelineId}
        search={searchValue}
        itemFilters={{
          userIds,
          priorities,
          assignedUserIds,
          labelIds,
          productIds,
          companyIds: [],
          customerIds: [],
          startDate,
          endDate
        }}
        type={type}
      />
    </ArchiveWrapper>
  );
}

export default Archive;
