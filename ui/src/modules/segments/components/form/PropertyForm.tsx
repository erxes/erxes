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
  chosenOperator?: object;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { chosenOperator: undefined };
  }

  onClickOperator = value => {
    console.log(value);
    this.setState({ chosenOperator: value });
  };

  renderOperators = () => {
    const { field } = this.props;
    const { chosenOperator } = this.state;

    const { type } = field;

    const operators = OPERATORS[type || ''] || DEFAULT_OPERATORS;

    return operators.map(operator => {
      return (
        <>
          <FormControl
            componentClass="checkbox"
            onChange={this.onClickOperator.bind(this, operator.value)}
            value={operator.value}
            checked={operator.value === chosenOperator}
          >
            {operator.name}
          </FormControl>
        </>
      );
    });
  };

  render() {
    const { onClickBack, field } = this.props;

    return (
      <div>
        <p onClick={onClickBack.bind(this)}>back</p>
        <ControlLabel>{field.label}</ControlLabel>
        <FormGroup>{this.renderOperators()}</FormGroup>
      </div>
    );
  }
}

export default PropertyForm;
