import React from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { withApollo } from 'react-apollo';
import { Icon, Button } from 'modules/common/components';
import { router } from 'modules/common/utils';
import {
  FlexRow,
  FlexItem,
  DateFilters
} from 'modules/inbox/components/sidebar/styles';
import { PopoverButton } from 'modules/inbox/styles';

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
      endDate: null
    };

    if (startDate) {
      this.state.startDate = moment(startDate);
    }

    if (endDate) {
      this.state.endDate = moment(endDate);
    }

    this.renderPopover = this.renderPopover.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.filterByDate = this.filterByDate.bind(this);
  }

  onDateChange(type, date) {
    this.setState({ [type]: date });
  }

  filterByDate() {
    const { startDate, endDate } = this.state;

    const formattedStartDate = moment(startDate).format(format);
    const formattedEndDate = moment(endDate).format(format);

    router.setParams(this.props.history, {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
  }

  renderPopover() {
    const { __ } = this.context;

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
            <Button btnStyle="simple" onClick={() => this.filterByDate()}>
              Filter
            </Button>
          </FlexRow>
        </DateFilters>
      </Popover>
    );
  }

  render() {
    const { __ } = this.context;

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

DateFilter.propTypes = propTypes;
DateFilter.contextTypes = {
  __: PropTypes.func
};

export default withApollo(DateFilter);
