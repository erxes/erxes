import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';
import { DEFAULT_OPERATORS, OPERATORS } from '../constants';

type Props = {
  condition: ISegmentCondition;
  field: any;
};

type State = {};

class ConditionDetail extends React.Component<Props, State> {
  renderOperator = () => {
    const { condition, field } = this.props;

    const { selectOptions = [], choiceOptions = [], type } = field;
    const { propertyOperator, propertyValue } = condition;

    const operators = OPERATORS[type || ''] || DEFAULT_OPERATORS;
    const operator = operators.find(op => {
      return op.value === propertyOperator;
    });

    const text = operator.name;

    if (selectOptions.length > 0) {
      const option = selectOptions.find(selectOption => {
        return selectOption.value === propertyValue;
      });

      console.log(option);
    }

    if (choiceOptions.length > 0) {
      const option = choiceOptions.find(choiceOption => {
        return choiceOption.value === propertyValue;
      });

      console.log(option);
    }

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
    const { propertyValue } = condition;

    const operator = this.renderOperator();

    const value = this.renderValue();

    if (
      propertyValue &&
      ['is', 'ins', 'it', 'if'].indexOf(propertyValue) >= 0
    ) {
      return <p>{`${condition.propertyType}'s ${label} ${operator}`}</p>;
    }

    return <p>{`${condition.propertyType}'s ${label} ${operator} ${value}`}</p>;
  }
}

export default ConditionDetail;
