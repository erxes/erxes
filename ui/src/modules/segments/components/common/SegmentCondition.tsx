import React from 'react';
import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { IConditionFilter, ISegment } from '../../types';
import { FlexRightItem } from 'modules/layout/styles';
import { ConditionItem, FilterProperty, FilterRow } from '../styles';

type Props = {
  segments: ISegment[];
  conditionKey: string;
  value: string;
  onChange: (args: { key?: string; value: string }) => void;
  onRemove: (id: string) => void;
};

type State = {
  key: string;
  currentValue: string;
};

class Condition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { conditionKey, value } = this.props;

    this.state = {
      key: conditionKey || '',
      currentValue: value
    };
  }

  removeCondition = () => {
    this.props.onRemove(this.props.conditionKey);
  };

  onChangeFilter = (filter: IConditionFilter) => {
    const { onChange, conditionKey } = this.props;

    return onChange({
      key: conditionKey,
      value: filter.value
    });
  };

  onRemove = () => {
    const { onRemove } = this.props;

    if (onRemove) {
      onRemove(this.props.conditionKey || '');
    }
  };

  renderRemoveButton = () => {
    const { onRemove } = this.props;

    if (!onRemove) {
      return;
    }

    return (
      <Button
        className="round"
        btnStyle="danger"
        icon="times"
        onClick={this.onRemove}
      />
    );
  };

  onChange = () => {
    const { currentValue } = this.state;
    const { onChange, conditionKey } = this.props;

    return onChange({
      key: conditionKey,
      value: currentValue
    });
  };

  onChangeOperators = (e: React.FormEvent<HTMLElement>) => {
    this.setState(
      { currentValue: (e.currentTarget as HTMLInputElement).value },
      this.onChange
    );
  };

  renderSegments() {
    const { segments } = this.props;
    const { currentValue } = this.state;

    return (
      <FormControl
        id="segment-select-operator"
        key={currentValue}
        componentClass="select"
        onChange={this.onChangeOperators}
        value={currentValue}
      >
        <option value="">{__('Select segment')}...</option>
        {segments.map((segment, index) => (
          <option value={segment._id} key={`${index}-${segment._id}`}>
            {segment.name}
          </option>
        ))}
      </FormControl>
    );
  }

  render() {
    return (
      <ConditionItem useMargin={false}>
        <FilterRow>
          <FilterProperty>{this.renderSegments()}</FilterProperty>
        </FilterRow>
        <FlexRightItem>{this.renderRemoveButton()}</FlexRightItem>
      </ConditionItem>
    );
  }
}

export default Condition;
