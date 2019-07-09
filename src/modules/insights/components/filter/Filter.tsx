import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import moment from 'moment';
import React from 'react';
import Datetime from 'react-datetime';
import { FlexItem, FlexRow, InsightFilter, InsightTitle } from '../../styles';
import { IQueryParams } from '../../types';

type Props = {
  content: React.ReactNode;
  onApplyClick: (
    args: { startDate: moment.Moment; endDate: moment.Moment }
  ) => void;
  history: any;
  queryParams: IQueryParams;
};

type States = {
  startDate: moment.Moment;
  endDate: moment.Moment;
};

class Filter extends React.Component<Props, States> {
  constructor(props) {
    super(props);

    let { startDate, endDate } = props.queryParams;

    if (!startDate && !endDate) {
      startDate = moment().add(-7, 'days');
      endDate = moment();
    }

    this.state = {
      startDate: moment(startDate),
      endDate: moment(endDate)
    };
  }

  onDateInputChange = (type: string, date) => {
    if (type === 'endDate') {
      this.setState({ endDate: date });
    } else {
      this.setState({ startDate: date });
    }
  };

  onClick = () => {
    this.props.onApplyClick(this.state);
  };

  render() {
    const { content } = this.props;

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
              onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </FlexItem>
          <FlexItem>
            <ControlLabel>End date</ControlLabel>
            <Datetime
              {...dateProps}
              value={this.state.endDate}
              onChange={this.onDateInputChange.bind(this, 'endDate')}
            />
          </FlexItem>
          <Button btnStyle="success" icon="filter" onClick={this.onClick}>
            Filter
          </Button>
        </FlexRow>
      </InsightFilter>
    );
  }
}

export default Filter;
