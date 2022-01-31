import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import React from 'react';
import { TRIGGERS } from '../../constants';
import Histories from '../../containers/Histories';
import { IAutomation } from '../../types';
import { HistoriesWrapper, FilterWrapper, FilterDateItem } from './styles';
import { __ } from 'modules/common/utils';
import Icon from 'modules/common/components/Icon';
import Select from 'react-select-plus';

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

  onSelect = (
    name: string,
    selectedItem: string & { value: string; label?: string }
  ) => {
    const value = selectedItem ? selectedItem.value : '';

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
    const { status, triggerId, triggerType, beginDate, endDate } = this.state;

    this.setState({
      filterParams: {
        status,
        triggerId,
        triggerType,
        beginDate,
        endDate
      }
    });
  };

  renderDateFilter = (key: string, name: string) => {
    const props = {
      value: this.state[key],
      inputProps: {
        placeholder: `${__(`Filter by ${__(name)}`)}`
      }
    };

    return (
      <FilterDateItem>
        <div className="icon-option">
          <Icon icon="calendar-alt" />
          <Datetime
            {...props}
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            onChange={this.onDateChange.bind(this, key)}
            closeOnSelect={true}
          />
        </div>
      </FilterDateItem>
    );
  };

  render() {
    const { automation } = this.props;
    const { status, triggerId, triggerType, filterParams } = this.state;

    return (
      <HistoriesWrapper>
        <FilterWrapper>
          {this.renderDateFilter('beginDate', 'Begin Date')}
          {this.renderDateFilter('endDate', 'End Date')}
          <FilterDateItem>
            <div className="icon-option">
              <Icon icon="checked-1" />
              <Select
                placeholder={__('Filter by Status')}
                value={status}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'waiting', label: 'Waiting' },
                  { value: 'error', label: 'Error' },
                  { value: 'missed', label: 'Missed' },
                  { value: 'complete', label: 'Complete' }
                ]}
                onChange={this.onSelect.bind(this, 'status')}
              />
            </div>
          </FilterDateItem>
          <FilterDateItem>
            <div className="icon-option">
              <Icon icon="swatchbook" />
              <Select
                placeholder={__('Filter by Trigger')}
                value={triggerId}
                options={[
                  ...automation.triggers.map(t => ({
                    value: t.id,
                    label: t.label
                  }))
                ]}
                onChange={this.onSelect.bind(this, 'triggerId')}
              />
            </div>
          </FilterDateItem>
          <FilterDateItem>
            <div className="icon-option">
              <Icon icon="cell" />
              <Select
                placeholder={__('Filter by Trigger Type')}
                value={triggerType}
                options={[
                  ...TRIGGERS.map(t => ({ value: t.type, label: t.label }))
                ]}
                onChange={this.onSelect.bind(this, 'triggerType')}
              />
            </div>
          </FilterDateItem>
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
      </HistoriesWrapper>
    );
  }
}

export default HistoriesHeader;
