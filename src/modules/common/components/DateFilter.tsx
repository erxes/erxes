import gql from 'graphql-tag';
import { Button, Icon } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import moment from 'moment';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Datetime from 'react-datetime';
import styled from 'styled-components';
import { colors, dimensions, typography } from '../styles';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  button {
    padding: 0;
  }

  i {
    margin-left: 5px;
    margin-right: 0;
    font-size: 10px;
    transition: all ease 0.3s;
    color: ${colors.colorCoreGray};
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
  }

  &:hover {
    cursor: pointer;
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px ${dimensions.unitSpacing}px;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const FlexItem = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const DateFilters = styled.div`
  width: 305px;

  button {
    padding: 5px 20px;
  }
`;

type Props = {
  queryParams?: any,
  history: any,
  client: any,
  countQuery?: string,
  countQueryParam?: string
};

type State = {
  startDate: Date,
  endDate: Date,
  totalCount: number,
}

const format = 'YYYY-MM-DD HH:mm';

class DateFilter extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { startDate, endDate } = props.queryParams;

    const state = {
      startDate: null,
      endDate: null,
      totalCount: 0
    };

    if (startDate) {
      state.startDate = moment(startDate);
    }

    if (endDate) {
      state.endDate = moment(endDate);
    }

    this.state = state;

    this.renderPopover = this.renderPopover.bind(this);
    this.refetchCountQuery = this.refetchCountQuery.bind(this);
    this.renderCount = this.renderCount.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.filterByDate = this.filterByDate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { queryParams } = nextProps;

    if (nextProps.countQuery) {
      if (queryParams.startDate && queryParams.endDate) {
        this.refetchCountQuery();
      }
    }
  }

  onDateChange(type, date) {
    this.setState({ [type]: date });
  }

  refetchCountQuery() {
    const { client, queryParams, countQuery, countQueryParam } = this.props;

    client
      .query({
        query: gql(countQuery),
        variables: { ...queryParams }
      })

      .then(({ data }) => {
        this.setState({
          totalCount: data[countQueryParam]
        });
      });
  }

  filterByDate() {
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
  }

  renderCount() {
    const { totalCount } = this.state;

    if (this.props.countQuery) {
      return (
        <FlexRow>
          <FlexItem>
            <span>
              {__('Total')}: {totalCount}
            </span>
          </FlexItem>
        </FlexRow>
      );
    }

    return null;
  }

  renderPopover() {
    const props = {
      inputProps: { placeholder: __('Select a date').toString() },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD',
      closeOnSelect: true
    };

    return (
      <Popover id="filter-popover" title={__('Filter by date')}>
        <DateFilters>
          <FlexRow>
            <FlexItem>
              <Datetime
                {...props}
                value={this.state.startDate}
                onChange={date => this.onDateChange('startDate', date)}
              />
            </FlexItem>

            <FlexItem>
              <Datetime
                {...props}
                value={this.state.endDate}
                onChange={date => this.onDateChange('endDate', date)}
              />
            </FlexItem>
          </FlexRow>

          {this.renderCount()}

          <FlexRow>
            <Button btnStyle="simple" onClick={() => this.filterByDate()}>
              Filter
            </Button>
          </FlexRow>
        </DateFilters>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        shouldUpdatePosition
        rootClose
      >
        <PopoverButton>
          {__('Date')} <Icon icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

export default withApollo(DateFilter);
