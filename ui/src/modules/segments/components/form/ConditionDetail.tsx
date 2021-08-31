import { ISegmentCondition } from 'modules/segments/types';
import React from 'react';

type Props = {
  condition: ISegmentCondition;
  field: any;
};

type State = {};

class ConditionDetail extends React.Component<Props, State> {
  renderProperty = () => {
    const { condition, field } = this.props;

    const { selectOptions = [], choiceOptions = [] } = field;
    const { propertyOperator, propertyValue } = condition;

    let text = propertyOperator;

    console.log(field);

    if (
      propertyOperator &&
      ['is', 'ins', 'it', 'if'].indexOf(propertyOperator) >= 0
    ) {
      switch (propertyOperator) {
        case 'is':
          text = 'is set';

          break;
        case 'ins':
          text = 'is not set';

          break;

        case 'it':
          text = 'is true';

          break;

        case 'if':
          text = 'is false';

          break;
      }

      return text;
    }

    if (selectOptions.length > 0) {
      const option = selectOptions.find(selectOption => {
        return selectOption.value === propertyValue;
      });

      text = option.label;
    }

    if (choiceOptions.length > 0) {
      const option = choiceOptions.find(choiceOption => {
        return choiceOption.value === propertyValue;
      });

      text = option.label;
    }

    return text;
  };

  render() {
    const { condition } = this.props;

    console.log(this.renderProperty());
    return (
      <p>{`${condition.propertyType}'s value = ${condition.propertyValue}`}</p>
    );
  }
}

export default ConditionDetail;
