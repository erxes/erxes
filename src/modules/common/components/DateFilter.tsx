import gql from 'graphql-tag';
import { Button, Icon } from 'modules/common/components';
import { __, Alert, router } from 'modules/common/utils';
import { PopoverButton } from 'modules/inbox/styles';
import * as moment from 'moment';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import * as Datetime from 'react-datetime';
import styled from 'styled-components';
import { dimensions } from '../styles';

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
      totalCount: 0
    };

    if (startDate) {
      state.startDate = moment(startDate).toDate();
    }

    if (endDate) {
      state.endDate = moment(endDate).toDate();
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
      this.setState({ [type]: date } as Pick<State, keyof State>);
    }
  };

  refetchCountQuery = () => {
    const { client, queryParams, countQuery, countQueryParam } = this.props;

    if (!countQuery || !countQueryParam) {
      return;
    }

    client
      .query({
        query: gql(countQuery),
        variables: { ...queryParams }
      })

      .then(({ data }) => {
        this.setState({
          totalCount: data[countQueryParam]
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  filterByDate = () => {
    const { startDate, endDate } = this.state;

    const formattedStartDate = moment(startDate).format(format);
    const formattedEndDate = moment(endDate).format(format);

    router.setParams(this.props.history, {
      startDate: formattedStartDate,
      endDate: formattedEndDate
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
      closeOnSelect: false
    };

    const onChangeStart = date => {
      if (typeof date !== 'string') {
        this.onDateChange('startDate', date.toDate());
      }
    };

    const onChangeEnd = date => {
      if (typeof date !== 'string') {
        this.onDateChange('endDate', date.toDate());
      }
    };

    return (
      <Popover id="date-popover" title={__('Filter by date')}>
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
            icon="filter"
            size="small"
          >
            Filter
          </Button>
        </FlexRow>
      </Popover>
    );
  };

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        shouldUpdatePosition={true}
        rootClose={true}
      >
        <PopoverButton>
          {__('Date')} <Icon icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

export default withApollo<Props>(DateFilter);
