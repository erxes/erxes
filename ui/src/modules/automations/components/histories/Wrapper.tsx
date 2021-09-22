import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import { FilterWrapper } from 'modules/settings/permissions/styles';
import React from 'react';
import { TRIGGERS } from '../../constants';
import Histories from '../../containers/Histories';
import { IAutomation } from '../../types';

type Props = {
  automation: IAutomation;
};

type State = {
  page?: number;
  perPage?: number;
  status?: string;
  triggerId?: string;
  triggerType?: string;
  beginDate?: Date;
  endDate?: Date;
  filterParams: any;
};

class HistoriesHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      filterParams: {},
      page: 0,
      perPage: 20
    };
  }

  onSelect = e => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onDateChange = (type: string, date) => {
    const filter = { ...this.state };

    if (date) {
      filter[type] = dayjs(date).format('YYYY-MM-DD HH:mm');
    } else {
      filter.beginDate = undefined;
      filter.endDate = undefined;
    }

    this.setState(filter);
  };

  onFilter = e => {
    this.setState({
      filterParams: {
        status: this.state.status,
        triggerId: this.state.triggerId,
        triggerType: this.state.triggerType,
        beginDate: this.state.beginDate,
        endDate: this.state.endDate
      }
    });
  };

  renderDateFilter = (name: string) => {
    return (
      <>
        <ControlLabel>{`${name} date`}:</ControlLabel>
        <Datetime
          value={this.state[name]}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          closeOnSelect={true}
          onChange={this.onDateChange.bind(this, name)}
        />
      </>
    );
  };

  render() {
    const { automation } = this.props;
    const { status, triggerId, triggerType, filterParams } = this.state;

    return (
      <>
        <FilterWrapper style={{ padding: '10px 0px' }}>
          <strong>{'Filters'}:</strong>
          {this.renderDateFilter('start')}
          {this.renderDateFilter('end')}
          <ControlLabel>Status:</ControlLabel>
          <FormControl
            componentClass="select"
            name="status"
            defaultValue={status}
            onChange={this.onSelect}
            options={[
              { value: '', label: '' },
              { value: 'active', label: 'Active' },
              { value: 'waiting', label: 'Waiting' },
              { value: 'error', label: 'Error' },
              { value: 'missed', label: 'Missed' },
              { value: 'complete', label: 'Complete' }
            ]}
          />
          <ControlLabel>Trigger:</ControlLabel>
          <FormControl
            componentClass="select"
            name="triggerId"
            defaultValue={triggerId}
            onChange={this.onSelect}
            options={[
              { value: '', label: '' },
              ...automation.triggers.map(t => ({ value: t.id, label: t.label }))
            ]}
          />
          <ControlLabel>Trigger Type:</ControlLabel>
          <FormControl
            componentClass="select"
            name="triggerType"
            defaultValue={triggerType}
            onChange={this.onSelect}
            options={[
              { value: '', label: '' },
              ...TRIGGERS.map(t => ({ value: t.type, label: t.label }))
            ]}
          />
          <Button
            btnStyle="primary"
            icon="filter-1"
            onClick={this.onFilter}
            size="small"
          >
            {'Filter'}
          </Button>
        </FilterWrapper>
        <Histories {...this.props} filterParams={filterParams} />
      </>
    );
  }
}

export default HistoriesHeader;
