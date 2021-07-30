import React from 'react';
import { IField } from 'modules/settings/properties/types';
import { ItemContainer } from 'modules/boards/styles/common';
import { Content } from 'modules/boards/styles/stage';
import FieldCondition from './FieldCondition';
import { LinkButton } from 'modules/settings/team/styles';
import Icon from 'modules/common/components/Icon';
import FormGroup from 'modules/common/components/form/Group';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';

export interface IFieldCondition {
  fieldId: string;
  fieldText: string;
  operator: string;
  value?: any;
  saved: boolean;
}

export interface IActionCondition {
  fieldConditions: IFieldCondition[];
  condition?: string;
}

type Props = {
  fields: IField[];
  condition?: IActionCondition;
  onUpdateCondition: (condition: IActionCondition) => void;
};

type State = {
  condition: IActionCondition;
};

class FieldConditions extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      condition: {
        condition: 'OR',
        fieldConditions: []
      }
    };
  }

  renderContent() {
    const { condition } = this.state;

    if (!condition) {
      return;
    }

    const { fieldConditions = [] } = condition;

    const onChangeCondition = (name, value, index) => {
      fieldConditions[index][name] = value;
      condition.fieldConditions = fieldConditions;
      this.setState({ condition });

      this.props.onUpdateCondition(condition);
    };

    const removeCondition = index => {
      condition.fieldConditions.splice(index, 1);
      this.setState({ condition });

      this.props.onUpdateCondition(condition);
    };

    return (
      <>
        {condition.fieldConditions.map((fieldCondition, index) => (
          <FieldCondition
            condition={fieldCondition}
            mainCondition={condition.condition || 'AND'}
            index={index}
            fields={this.props.fields}
            onChangeCondition={onChangeCondition}
            removeCondition={removeCondition}
            key={index}
            isLast={
              condition.fieldConditions.length - 1 !== index ? false : true
            }
          />
        ))}
      </>
    );
  }

  renderMainCondition() {
    const { condition } = this.state;

    if (condition.fieldConditions.length < 2) {
      return null;
    }

    const onChangeCondition = (e: React.FormEvent<HTMLElement>) => {
      condition.condition = (e.currentTarget as HTMLInputElement).value;

      this.setState({ condition });

      this.props.onUpdateCondition(condition);
    };
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Condition</ControlLabel>
          <FormControl
            name="mainCondition"
            componentClass="select"
            value={condition.condition || 'AND'}
            onChange={onChangeCondition}
          >
            <option value="AND">{__('And')}</option>
            <option value="OR">{__('Or')}</option>
          </FormControl>
        </FormGroup>
      </>
    );
  }

  render() {
    const { condition } = this.state;

    if (!condition) {
      return null;
    }

    const addCondition = () => {
      const newCondition: IFieldCondition = {
        fieldId: '',
        fieldText: '',
        operator: 'is',
        saved: false
      };

      condition.fieldConditions.push(newCondition);

      this.setState({ condition });

      this.props.onUpdateCondition(condition);
    };

    return (
      <>
        {this.renderMainCondition()}
        <ItemContainer>
          <Content>{this.renderContent()}</Content>
        </ItemContainer>

        <LinkButton onClick={addCondition}>
          <Icon icon="plus-1" /> Add Field Condition
        </LinkButton>
      </>
    );
  }
}

export default FieldConditions;
