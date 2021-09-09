import { __ } from 'modules/common/utils';
import { IField, ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import Select from 'react-select-plus';
import FormControl from 'modules/common/components/form/Control';
import { OPERATORS } from '../constants';
import { OperatorList } from '../styles';
import { Formgroup } from 'modules/common/components/form/styles';
import { CenterContent } from 'erxes-ui/lib/styles/main';
import Button from 'modules/common/components/Button';

type Props = {
  field: IField;
  onClickBack: () => void;
  segment: ISegmentMap;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  propertyType: string;
  pipelineId: string;
  boardId: string;
};

type State = {
  chosenOperator?: any;
  currentValue?: any;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { chosenOperator: undefined, currentValue: '' };
  }

  onClickOperator = operator => {
    if (['is', 'ins', 'it', 'if'].indexOf(operator.value) >= 0) {
      this.setState({
        chosenOperator: operator,
        currentValue: operator.value
      });
    } else {
      this.setState({ chosenOperator: operator, currentValue: '' });
    }
  };

  renderInput = operator => {
    const { chosenOperator } = this.state;

    if (
      chosenOperator &&
      chosenOperator.value === operator.value &&
      !operator.noInput
    ) {
      return this.renderPropertyComponent();
    }

    return;
  };

  renderSelect(
    value: string | number,
    options: Array<{ label: string; value: string | number }>
  ) {
    return (
      <Select
        placeholder={__('Select value')}
        value={value}
        options={options}
        isRequired={true}
        clearable={false}
        onChange={this.onChangeSelect}
      />
    );
  }

  onChangeSelect = (option: { value: string }) => {
    const value = !option ? '' : option.value.toString();

    this.setState({ currentValue: value });
  };

  onChangeValue = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      currentValue: (e.currentTarget as HTMLInputElement).value
    });
  };

  renderPropertyComponent = () => {
    const { currentValue, chosenOperator } = this.state;
    const { field } = this.props;

    const { value } = chosenOperator;

    const { selectOptions = [], choiceOptions = [], type } = field;

    if (['is', 'ins', 'it', 'if'].indexOf(value) >= 0) {
      return null;
    }

    if (selectOptions.length > 0) {
      return this.renderSelect(currentValue, selectOptions);
    }

    // if custom field is of type radio, then show options as select
    if (type === 'radio' && choiceOptions.length > 0) {
      const options = choiceOptions.map(opt => ({ value: opt, label: opt }));

      return this.renderSelect(currentValue, options);
    }

    return <FormControl value={currentValue} onChange={this.onChangeValue} />;
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

    const operators = OPERATORS[type || ''] || OPERATORS.string;

    return operators.map(operator => {
      return (
        <>
          <FormControl
            componentClass="radio"
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

  onClick = () => {
    const {
      segment,
      addCondition,
      field,
      propertyType,
      boardId,
      pipelineId
    } = this.props;
    const { chosenOperator, currentValue } = this.state;

    return addCondition(
      {
        type: 'property',
        propertyType,
        propertyName: field.value,
        propertyOperator: chosenOperator.value,
        propertyValue: currentValue
      },
      segment.key,
      boardId,
      pipelineId
    );
  };

  render() {
    const { field } = this.props;

    return (
      <OperatorList>
        <b>{field.label}</b>
        <Formgroup>{this.renderOperators()}</Formgroup>
        <CenterContent>
          <Button onClick={this.onClick} btnStyle="default">
            Apply filter
          </Button>
        </CenterContent>
      </OperatorList>
    );
  }
}

export default PropertyForm;
