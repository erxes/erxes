import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/segments/types';
import React from 'react';
import FormGroup from 'modules/common/components/form/Group';
import FormControl from 'modules/common/components/form/Control';
import { DEFAULT_OPERATORS, OPERATORS } from '../constants';

type Props = {
  field: IField;
  onClickBack: () => void;
};

type State = {
  chosenOperator?: any;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { chosenOperator: undefined };
  }

  onClickOperator = operator => {
    this.setState({ chosenOperator: operator });
  };

  renderInput = operator => {
    const { chosenOperator } = this.state;

    if (
      chosenOperator &&
      chosenOperator.value === operator.value &&
      !operator.noInput
    ) {
      return (
        <FormControl>
          <div>aaa</div>;
        </FormControl>
      );
    }

    return;
  };

  isChecked = operator => {
    const { chosenOperator } = this.state;

    if (chosenOperator) {
      return operator.value === chosenOperator.value;
    }

    return false;
  };

  renderOperators = () => {
    const { field } = this.props;

    const { type } = field;

    const operators = OPERATORS[type || ''] || DEFAULT_OPERATORS;

    return operators.map(operator => {
      return (
        <>
          <FormControl
            componentClass="checkbox"
            onChange={this.onClickOperator.bind(this, operator)}
            value={operator.value}
            checked={this.isChecked(operator)}
          >
            {operator.name}
          </FormControl>
          {this.renderInput(operator)}
        </>
      );
    });
  };

  render() {
    const { onClickBack, field } = this.props;

    return (
      <>
        <p onClick={onClickBack.bind(this)}>back</p>
        <ControlLabel>{field.label}</ControlLabel>
        <FormGroup>{this.renderOperators()}</FormGroup>
      </>
    );
  }
}

export default PropertyForm;
