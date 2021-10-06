import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';
import { DEFAULT_OPERATORS, OPERATORS } from '../constants';
import { ConditionDetailText, PropertyText } from '../styles';

type Props = {
  condition: ISegmentCondition;
  field: any;
  segmentKey: string;
  onClickProperty: (field, condition, segmentKey) => void;
};

class PropertyDetail extends React.Component<Props, {}> {
  onClickProperty = () => {
    const { field, onClickProperty, condition, segmentKey } = this.props;

    onClickProperty(field, condition, segmentKey);
  };

  renderOperator = () => {
    const { condition, field } = this.props;

    const { type } = field;
    const { propertyOperator } = condition;

    const operators = OPERATORS[type || ''] || DEFAULT_OPERATORS;
    const operator = operators.find(op => {
      return op.value === propertyOperator;
    });

    const text = operator.name;

    return text;
  };

  renderValue = () => {
    const { condition, field } = this.props;

    const { selectOptions = [], choiceOptions = [], type } = field;
    const { propertyValue } = condition;

    let text = propertyValue;

    if (selectOptions.length > 0) {
      const option = selectOptions.find(selectOption => {
        return selectOption.value === propertyValue;
      });

      text = option ? option.label : text;
    }

    if (type === 'radio' && choiceOptions.length > 0) {
      const option = choiceOptions.find(choiceOption => {
        return choiceOption === propertyValue;
      });

      text = option ? option : text;
    }

    return text;
  };

  render() {
    const { condition, field } = this.props;

    const { label, group } = field;
    const { propertyOperator, propertyType = '' } = condition;

    const operator = this.renderOperator();

    const value = this.renderValue();

    let propertyTypeText = propertyType.replace('_', ' ');
    let valueText = <span>{` ${operator} ${value}`}</span>;

    if (propertyType === 'form_submission') {
      propertyTypeText = group;
    }

    if (
      propertyOperator &&
      ['is', 'ins', 'it', 'if'].indexOf(propertyOperator) >= 0
    ) {
      valueText = <span>{` ${operator}`}</span>;
    }

    if (
      propertyOperator &&
      ['wobm', 'woam', 'wobd', 'woad'].indexOf(propertyOperator) >= 0
    ) {
      valueText = <span>{` ${value} ${operator}`}</span>;
    }

    return (
      <ConditionDetailText>
        <span>{`${propertyTypeText}'s`} </span>
        <PropertyText onClick={this.onClickProperty}>{label}</PropertyText>
        {valueText}
      </ConditionDetailText>
    );
  }
}

export default PropertyDetail;
