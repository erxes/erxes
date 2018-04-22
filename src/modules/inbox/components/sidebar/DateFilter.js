import React from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { Icon, Button } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { PopoverButton } from '../../styles';
import { queries } from '../../graphql';
import { FlexRow, FlexItem, DateFilters } from './styles';

const propTypes = {
  queryParams: PropTypes.object,
  history: PropTypes.object,
  client: PropTypes.object
};

const format = 'YYYY-MM-DD HH:mm';

class DateFilter extends React.Component {
  constructor(props) {
    super(props);

    const { startDate, endDate } = props.queryParams;

    this.state = {
      startDate: null,
      endDate: null,
      totalConversationsCount: 0
    };

    if (startDate) {
      this.state.startDate = moment(startDate);
    }

    if (endDate) {
      this.state.endDate = moment(endDate);
    }

    this.renderPopover = this.renderPopover.bind(this);
    this.refetchCountQuery = this.refetchCountQuery.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.filterByDate = this.filterByDate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { queryParams } = nextProps;

    if (queryParams.startDate && queryParams.endDate) {
      this.refetchCountQuery();
    }
  }

  onDateChange(type, date) {
    this.setState({ [type]: date });
  }

  refetchCountQuery() {
    const { client, queryParams } = this.props;

    client
      .query({
        query: gql(queries.totalConversationsCount),
        variables: { ...queryParams }
      })

      .then(({ data }) => {
        this.setState({
          totalConversationsCount: data.conversationsTotalCount
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

    this.refetchCountQuery();
  }

  renderPopover() {
    const { __ } = this.context;
    const { totalConversationsCount } = this.state;

    const props = {
      inputProps: { placeholder: __('Select a date') },
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

          <FlexRow>
            <FlexItem>
              <span>Total conversations: {totalConversationsCount}</span>
            </FlexItem>
          </FlexRow>

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
          Date <Icon icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

DateFilter.propTypes = propTypes;
DateFilter.contextTypes = {
  __: PropTypes.func
};

export default withApollo(DateFilter);
