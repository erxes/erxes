import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';
import { DEFAULT_OPERATORS, OPERATORS } from '../constants';
import { ConditionDetailText, PropertyText } from '../styles';

type Props = {
  condition: ISegmentCondition;
  field: any;
};

type State = {};

class ConditionDetail extends React.Component<Props, State> {
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

    const { selectOptions = [], choiceOptions = [] } = field;
    const { propertyValue } = condition;

    let text = propertyValue;

    if (selectOptions.length > 0) {
      const option = selectOptions.find(selectOption => {
        return selectOption.value === propertyValue;
      });

      text = option ? option.label : text;
    }

    if (choiceOptions.length > 0) {
      const option = choiceOptions.find(choiceOption => {
        return choiceOption.value === propertyValue;
      });

      text = option ? option.label : text;
    }

    return text;
  };

  render() {
    const { condition, field } = this.props;

    const { label } = field;
    const { propertyOperator, propertyType = '' } = condition;

    const operator = this.renderOperator();

    const value = this.renderValue();

    const propertyTypeText = propertyType.replace('_', ' ');

    if (
      propertyOperator &&
      ['is', 'ins', 'it', 'if'].indexOf(propertyOperator) >= 0
    ) {
      return (
        <ConditionDetailText>
          <span>{`${propertyTypeText}'s`} </span>
          <PropertyText>{label}</PropertyText>
          <span>{` ${operator}`}</span>
        </ConditionDetailText>
      );
    }

    if (
      propertyOperator &&
      ['wobm', 'woam', 'wobd', 'woad'].indexOf(propertyOperator) >= 0
    ) {
      return (
        <ConditionDetailText>
          <span>{`${propertyTypeText}'s`} </span>
          <PropertyText>{label}</PropertyText>
          <span>{` ${value} ${operator}`}</span>
        </ConditionDetailText>
      );
    }
    return (
      <ConditionDetailText>
        <span>{`${propertyTypeText}'s`} </span>
        <PropertyText>{label}</PropertyText>
        <span>{` ${operator} ${value}`}</span>
      </ConditionDetailText>
    );
  }
}

export default ConditionDetail;
