import Alert from '../utils/Alert';
import Button from './Button';
import Icon from './Icon';
import { Popover } from '@headlessui/react';
import { PopoverButton } from '../styles/main';
import React from 'react';
import { __ } from '../utils/core';
import asyncComponent from './AsyncComponent';
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
  history: any;
  countQuery?: string;
  countQueryParam?: string;
};

type ApolloClientProps = {
  client: any;
};

type State = {
  startDate: Date;
  endDate: Date;
  totalCount: number;
};

const format = 'YYYY-MM-DD HH:mm';

class DateFilter extends React.Component<Props & ApolloClientProps, State> {
  constructor(props) {
    super(props);

    const { startDate, endDate } = props.queryParams;

    const state: State = {
      startDate: new Date(),
      endDate: new Date(),
      totalCount: 0,
    };

    if (startDate) {
      state.startDate = dayjs(startDate).toDate();
    }

    if (endDate) {
      state.endDate = dayjs(endDate).toDate();
    }

    this.state = state;
  }

  componentWillReceiveProps(nextProps) {
    const { queryParams } = nextProps;

    if (nextProps.countQuery) {
      if (queryParams.startDate && queryParams.endDate) {
        this.refetchCountQuery();
      }
    }
  }

  onDateChange = <T extends keyof State>(type: T, date: State[T]) => {
    if (typeof date !== 'string') {
      this.setState({ [type]: date } as unknown as Pick<State, keyof State>);
    }
  };

  refetchCountQuery = () => {
    const { client, queryParams, countQuery, countQueryParam } = this.props;

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
        this.setState({
          totalCount: data[countQueryParam],
        });
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  filterByDate = () => {
    const { startDate, endDate } = this.state;

    const formattedStartDate = dayjs(startDate).format(format);
    const formattedEndDate = dayjs(endDate).format(format);

    if (formattedStartDate > formattedEndDate) {
      return Alert.error('The start date must be earlier than the end date.');
    }
    setParams(this.props.history, {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    if (this.props.countQuery) {
      this.refetchCountQuery();
    }
  };

  renderCount = () => {
    const { totalCount } = this.state;

    if (this.props.countQuery) {
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

  renderPopover = () => {
    const props = {
      inputProps: { placeholder: __('Select a date') },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD',
      closeOnSelect: false,
    };

    const onChangeStart = (date) => {
      if (typeof date !== 'string') {
        this.onDateChange('startDate', date);
      }
    };

    const onChangeEnd = (date) => {
      if (typeof date !== 'string') {
        this.onDateChange('endDate', date);
      }
    };

    return (
      <Popover.Panel>
        <h3>{__('Filter by date')}</h3>
        <FlexRow>
          <div>
            <DateName>Start Date</DateName>
            <Datetime
              {...props}
              input={false}
              value={this.state.startDate}
              onChange={onChangeStart}
            />
          </div>

          <div>
            <DateName>End Date</DateName>
            <Datetime
              {...props}
              input={false}
              value={this.state.endDate}
              onChange={onChangeEnd}
            />
          </div>
        </FlexRow>

        <FlexRow>
          {this.renderCount()}
          <Button
            btnStyle="warning"
            onClick={this.filterByDate}
            icon="filter-1"
            size="small"
          >
            Filter
          </Button>
        </FlexRow>
      </Popover.Panel>
    );
  };

  render() {
    return (
      <Popover>
        <PopoverButton>
          {__('Date')}
          <Icon icon="angle-down" />
        </PopoverButton>
      </Popover>
    );
  }
}

export default withApollo<Props>(DateFilter);
