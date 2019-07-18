import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { FlexItem, FlexRow, InsightFilter, InsightTitle } from '../../styles';
import { IQueryParams } from '../../types';

type Props = {
  content: React.ReactNode;
  onApplyClick: (args: { startDate: Date; endDate: Date }) => void;
  history: any;
  queryParams: IQueryParams;
};

type States = {
  startDate: Date;
  endDate: Date;
};

class Filter extends React.Component<Props, States> {
  constructor(props) {
    super(props);

    let { startDate, endDate } = props.queryParams;

    if (!startDate && !endDate) {
      startDate = dayjs().add(-7, 'day');
      endDate = dayjs();
    }

    this.state = {
      startDate: dayjs(startDate).toDate(),
      endDate: dayjs(endDate).toDate()
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
