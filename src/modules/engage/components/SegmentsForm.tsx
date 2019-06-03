import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import AddConditionButton from 'modules/segments/components/AddConditionButton';
import Conditions from 'modules/segments/components/Conditions';
import {
  ConditionWrapper,
  SegmentTitle
} from 'modules/segments/components/styles';
import {
  ISegment,
  ISegmentCondition,
  ISegmentDoc,
  ISegmentField
} from 'modules/segments/types';
import * as React from 'react';
import styled from 'styled-components';

const SegmentWrapper = styled.div`
  padding: 20px;
`;

type Props = {
  fields: ISegmentField[];
  create: (params: { doc: ISegmentDoc }) => void;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  createSegment: (value: boolean) => void;
};

type State = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: ISegmentCondition[];
  connector: string;
};

class SegmentsForm extends React.Component<Props, State> {
  static generateRandomColorCode() {
    return `#${Math.random()
      .toString(16)
      .slice(2, 8)}`;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      subOf: '',
      color: SegmentsForm.generateRandomColorCode(),
      conditions: [],
      connector: 'any'
    };
  }

  addCondition = condition => {
    this.setState({
      conditions: [...this.state.conditions, condition]
    });
  };

  changeCondition = condition => {
    this.setState({
      conditions: this.state.conditions.map(c =>
        c.field === condition.field ? condition : c
      )
    });

    const segment = {
      name: this.state.name,
      description: this.state.description,
      subOf: this.state.subOf,
      color: this.state.color,
      conditions: this.state.conditions,
      connector: this.state.connector
    };

    this.props.count(segment);
  };

  removeCondition = conditionField => {
    this.setState({
      conditions: this.state.conditions.filter(c => c._id !== conditionField)
    });
  };

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const {
      name,
      description,
      subOf,
      color,
      connector,
      conditions
    } = this.state;

    const params = {
      doc: { name, description, subOf, color, connector, conditions }
    };

    if (subOf) {
      params.doc.subOf = subOf;
    }

    this.props.create(params);
    this.props.createSegment(false);
  };

  renderConditions() {
    const { fields } = this.props;
    const selectedFieldIds = this.state.conditions.map(c => c.field);

    // Exclude fields that are already selected
    const changedFields = fields.filter(
      field => selectedFieldIds.indexOf(field._id) < 0
    );

    const connectorOnChange = e =>
      this.handleChange('connector', (e.target as HTMLInputElement).value);

    return (
      <ConditionWrapper>
        <FormGroup>
          {__('Users who match')}{' '}
          <FormControl
            componentClass="select"
            value={this.state.connector}
            onChange={connectorOnChange}
          >
            <option value="any">{__('any')}</option>
            <option value="all">{__('all')}</option>
          </FormControl>
          {__('of the below conditions')}
        </FormGroup>

        <Conditions
          contentType="customer"
          fields={fields}
          parentSegmentId={this.state.subOf}
          conditions={this.state.conditions}
          changeCondition={this.changeCondition}
          removeCondition={this.removeCondition}
        />

        <AddConditionButton
          fields={changedFields}
          addCondition={this.addCondition}
        />
      </ConditionWrapper>
    );
  }

  renderForm() {
    const onChangeName = e =>
      this.handleChange('name', (e.target as HTMLInputElement).value);

    const onChangeDesc = e =>
      this.handleChange('description', (e.target as HTMLInputElement).value);

    const onChangeSubOf = e =>
      this.handleChange('subOf', (e.target as HTMLInputElement).value);

    const onChangeColor = e =>
      this.handleChange('color', (e.target as HTMLInputElement).value);

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            required={true}
            value={this.state.name}
            onChange={onChangeName}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            value={this.state.description || ''}
            onChange={onChangeDesc}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Sub segment of</ControlLabel>
          <FormControl
            componentClass="select"
            value={this.state.subOf || ''}
            onChange={onChangeSubOf}
          >
            <option value="">[not selected]</option>
            {this.props.headSegments.map(segment => (
              <option value={segment._id} key={segment._id}>
                {segment.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color</ControlLabel>
          <FormControl
            type="color"
            value={this.state.color}
            onChange={onChangeColor}
          />
        </FormGroup>

        <Button
          size="small"
          btnStyle="success"
          onClick={this.save}
          icon="checked-1"
        >
          Save
        </Button>
      </form>
    );
  }

  render() {
    return (
      <SegmentWrapper>
        <SegmentTitle>Filters</SegmentTitle>
        {this.renderConditions()}
        <hr />
        {this.renderForm()}
      </SegmentWrapper>
    );
  }
}

export default SegmentsForm;
