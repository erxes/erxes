import { PopoverButton, PopoverHeader } from '../styles/main';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../utils/Alert';
import Button from './Button';
import Icon from './Icon';
import { Popover } from '@headlessui/react';
import { __ } from '../utils/core';
import asyncComponent from './AsyncComponent';
import client from '@erxes/ui/src/apolloClient';
import dayjs from 'dayjs';
import { dimensions } from '../styles';
import { gql } from '@apollo/client';
import { setParams } from '../utils/router';
import styled from 'styled-components';
import { withApollo } from '@apollo/client/react/hoc';

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime'),
);

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px;
`;

const FlexItem = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const DateName = styled.div`
  text-transform: uppercase;
  margin: ${dimensions.unitSpacing}px 0;
  text-align: center;
`;

type Props = {
  queryParams?: any;
  countQuery?: string;
  countQueryParam?: string;
};

const format = 'YYYY-MM-DD HH:mm';

const DateFilter: React.FC<Props> = (props) => {
  const { queryParams, countQuery, countQueryParam } = props;
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalCount, setTotalCount] = useState<number>(0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { startDate, endDate } = queryParams;

    if (startDate) {
      setStartDate(dayjs(startDate).toDate());
    }

    if (endDate) {
      setEndDate(dayjs(endDate).toDate());
    }
  }, [queryParams]);

  useEffect(() => {
    if (countQuery && queryParams.startDate && queryParams.endDate) {
      refetchCountQuery();
    }
  }, [countQuery, queryParams]);

  const onDateChange = (type: 'startDate' | 'endDate', date: Date) => {
    if (typeof date !== 'string') {
      type === 'startDate' ? setStartDate(date) : setEndDate(date);
    }
  };

  const refetchCountQuery = () => {
    if (!countQuery || !countQueryParam) {
      return;
    }

    const variables = { ...queryParams };

    if (queryParams.limit) {
      variables.limit = parseInt(queryParams.limit, 10);
    }

    client
      .query({
        query: gql(countQuery),
        variables,
      })
      .then(({ data }) => {
        setTotalCount(data[countQueryParam]);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const filterByDate = () => {
    const formattedStartDate = dayjs(startDate).format(format);
    const formattedEndDate = dayjs(endDate).format(format);

    if (formattedStartDate > formattedEndDate) {
      return Alert.error('The start date must be earlier than the end date.');
    }

    setParams(navigate, location, {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    if (countQuery) {
      refetchCountQuery();
    }
  };

  const renderCount = () => {
    if (countQuery) {
      return (
        <FlexItem>
          <span>
            {__('Total')}: <b>{totalCount}</b>
          </span>
        </FlexItem>
      );
    }

    return null;
  };

  const renderPopover = () => {
    const props = {
      inputProps: { placeholder: 'Select a date' },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD',
      closeOnSelect: false,
    };

    const onChangeStart = (date) => {
      if (typeof date !== 'string') {
        onDateChange('startDate', date);
      }
    };

    const onChangeEnd = (date) => {
      if (typeof date !== 'string') {
        onDateChange('endDate', date);
      }
    };

    return (
      <>
        <PopoverHeader>{__('Filter by date')}</PopoverHeader>
        <FlexRow>
          <div>
            <DateName>Start Date</DateName>
            <Datetime
              {...props}
              input={false}
              value={startDate}
              onChange={onChangeStart}
            />
          </div>

          <div>
            <DateName>End Date</DateName>
            <Datetime
              {...props}
              input={false}
              value={endDate}
              onChange={onChangeEnd}
            />
          </div>
        </FlexRow>

        <FlexRow>
          {renderCount()}
          <Button
            btnStyle="warning"
            onClick={filterByDate}
            icon="filter-1"
            size="small"
          >
            Filter
          </Button>
        </FlexRow>
      </>
    );
  };

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button>
            <PopoverButton>
              {__('Date')}
              <Icon icon={open ? 'angle-up' : 'angle-down'} />
            </PopoverButton>
          </Popover.Button>
          <Popover.Panel className="date-popover">
            {renderPopover()}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default withApollo<Props>(DateFilter);
