import { __ } from '@erxes/ui/src';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormGroup from '@erxes/ui/src/components/form/Group';
import {
  CustomRangeContainer,
  EndDateContainer
} from '@erxes/ui-forms/src/forms/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import { Features } from '../../../../styles';

type Props = {
  config?: any;
  onChange: (config) => void;
};

type State = {
  selectDateType: string;
};

const types = ['default', 'range', 'cycle'];

const capitalizeFirstLetter = text => {
  return text[0].toUpperCase() + text.slice(1);
};

class DateSettings extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const selectDateType = props?.config?.dateConfig?.type;

    this.state = {
      selectDateType: selectDateType || 'default'
    };
  }

  renderRangeTypeComponent(dateConfig, onChangeDate) {
    return (
      <>
        <CustomRangeContainer>
          <DateContainer>
            <DateControl
              value={dateConfig?.startDate}
              placeholder="select start date "
              onChange={e => onChangeDate(e, 'startDate')}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <DateControl
                value={dateConfig?.endDate}
                placeholder="select  end date "
                onChange={e => onChangeDate(e, 'endDate')}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </>
    );
  }

  renderCycleTypeComponent(dateConfig, onChangeDate) {
    const frequencyOptions = [
      {
        value: 'everyYear',
        label: 'Every Year'
      },
      {
        value: 'everyMonth',
        label: 'Every Month'
      }
    ];

    const renderDateFormat = () => {
      if (dateConfig?.frequencyType === 'everyMonth') {
        return 'DD';
      }
      return 'MMM,DD';
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Frequency Type')}</ControlLabel>
          <Select
            options={frequencyOptions}
            onChange={({ value }) => onChangeDate(value, 'frequencyType')}
            value={dateConfig?.frequencyType}
          />
        </FormGroup>
        <Features isToggled={dateConfig?.frequencyType}>
          <CustomRangeContainer>
            <DateContainer>
              <ControlLabel>{__('Select a start date')}</ControlLabel>
              <DateControl
                placeholder="select a date"
                value={dateConfig?.startDate}
                dateFormat={renderDateFormat()}
                onChange={date => onChangeDate(date, 'startDate')}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <ControlLabel>
                  {__('Select a end date (optional)')}
                </ControlLabel>
                <DateControl
                  placeholder="select a date"
                  value={dateConfig?.endDate}
                  onChange={date => onChangeDate(date, 'endDate')}
                  dateFormat={renderDateFormat()}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </Features>
      </>
    );
  }

  renderDateComponent() {
    const { config, onChange } = this.props;
    const { selectDateType } = this.state;

    const dateConfig = config?.dateConfig || {};

    const onChangeDate = (value, name) => {
      let dateConfig = { ...(config?.dateConfig || {}), type: selectDateType };

      dateConfig[name] = value;

      onChange({ ...config, dateConfig });
    };

    if (selectDateType === 'range') {
      return this.renderRangeTypeComponent(dateConfig, onChangeDate);
    }

    if (selectDateType === 'cycle') {
      return this.renderCycleTypeComponent(dateConfig, onChangeDate);
    }

    return (
      <DateControl
        placeholder="select a date"
        value={dateConfig?.date}
        onChange={e => onChangeDate(e, 'date')}
      />
    );
  }

  render() {
    const { onChange } = this.props;
    const { selectDateType } = this.state;

    const onSelectType = ({ value }) => {
      this.setState({ selectDateType: value });

      const { dateConfig, ...config } = this.props.config;

      onChange(config);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Select Type')}</ControlLabel>
          <Select
            options={types.map(type => ({
              value: type,
              label: capitalizeFirstLetter(type)
            }))}
            value={selectDateType}
            onChange={onSelectType}
          />
        </FormGroup>

        {this.renderDateComponent()}
      </>
    );
  }
}

export default DateSettings;
