import { ControlLabel } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import { FlexItem, FlexRow, InsightFilter, InsightTitle } from '../../styles';
import { IQueryParams } from '../../types';

type Props = {
  content: React.ReactNode;
  applyBtn: React.ReactNode;
  history: any;
  queryParams: IQueryParams;
  days?: number;
};

type States = {
  isChange: boolean;
  startDate: Date;
  endDate: Date;
};

class Filter extends React.Component<Props, States> {
  static defaultProps = {
    days: 7
  };

  constructor(props) {
    super(props);

    let { startDate, endDate } = props.queryParams;

    if (!startDate && !endDate) {
      startDate = moment()
        .add(-props.days, 'days')
        .format('YYYY-MM-DD HH:mm');
      endDate = moment().format('YYYY-MM-DD HH:mm');
    }

    this.state = {
      startDate,
      endDate,
      // check condition for showing placeholder
      isChange: false
    };
  }

  onDateInputChange = (type: string, date) => {
    if (type === 'endDate') {
      this.setState({ endDate: date, isChange: true });
    } else {
      this.setState({ startDate: date, isChange: true });
    }
  };

  onFilterByDate = (type: string, date) => {
    if (this.state.isChange) {
      const formatDate = date ? moment(date).format('YYYY-MM-DD HH:mm') : null;
      router.setParams(this.props.history, { [type]: formatDate });
    }
  };

  render() {
    const { content, applyBtn } = this.props;

    const dateProps = {
      inputProps: { placeholder: 'Click to select a date' },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD'
    };

    return (
      <InsightFilter>
        <InsightTitle>{__('Filter')}</InsightTitle>
        <FlexRow>
          {content}
          <FlexItem>
            <ControlLabel>Start date</ControlLabel>
            <Datetime
              {...dateProps}
              value={this.state.startDate}
              onBlur={this.onFilterByDate.bind(this, 'startDate')}
              onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </FlexItem>
          <FlexItem>
            <ControlLabel>End date</ControlLabel>
            <Datetime
              {...dateProps}
              value={this.state.endDate}
              onBlur={this.onFilterByDate.bind(this, 'endDate')}
              onChange={this.onDateInputChange.bind(this, 'endDate')}
            />
          </FlexItem>
          {applyBtn}
        </FlexRow>
      </InsightFilter>
    );
  }
}

export default Filter;
