import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ContentSpace, FlexContent, FlexItem } from 'modules/layout/styles';
import AddConditionButton from 'modules/segments/components/AddConditionButton';
import Conditions from 'modules/segments/components/Conditions';
import {
  ConditionWrapper,
  SegmentTitle
} from 'modules/segments/components/styles';
import { ISegment, ISegmentField } from 'modules/segments/types';
import React, { Component } from 'react';
import styled from 'styled-components';

const SegmentWrapper = styled.div`
  padding: 20px;
`;

type Props = {
  fields: ISegmentField[];
  create: (params: any) => void;
  headSegments: ISegment[];
  count: (segment: any) => void;
  createSegment: (value: boolean) => void;
};

type State = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  conditions: any[];
  connector: string;
}

class SegmentsForm extends Component<Props, State> {
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

    this.addCondition = this.addCondition.bind(this);
    this.changeCondition = this.changeCondition.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  addCondition(condition) {
    this.setState({
      conditions: [...this.state.conditions, condition]
    });
  }

  changeCondition(condition) {
    this.setState({
      conditions: this.state.conditions.map(
        c => (c.field === condition.field ? condition : c)
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
  }

  removeCondition(conditionField) {
    this.setState({
      conditions: this.state.conditions.filter(c => c.field !== conditionField)
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }

  save(e) {
    e.preventDefault();

    const {
      name,
      description,
      subOf,
      color,
      connector,
      conditions
    } = this.state;

    const params = { doc: { name, description, subOf, color, connector, conditions } };

    if (subOf) {
      params.doc.subOf = subOf;
    }

    this.props.create(params);
    this.props.createSegment(false);
  }

  renderConditions() {
    const { fields } = this.props;
    const selectedFieldIds = this.state.conditions.map(c => c.field);

    // Exclude fields that are already selected
    const changedFields = fields.filter(
      field => selectedFieldIds.indexOf(field._id) < 0
    );

    return (
      <ConditionWrapper>
        <FormGroup>
          Users who match
          <FormControl
            name="connector"
            componentClass="select"
            value={this.state.connector}
            onChange={this.handleChange}
          >
            <option value="any">any</option>
            <option value="all">all</option>
          </FormControl>
          of the below conditions
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
    return (
      <FlexContent>
        <FlexItem>
          <form onSubmit={this.save}>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                name="name"
                type="text"
                required
                value={this.state.name}
                onChange={this.handleChange}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                name="description"
                type="text"
                value={this.state.description || ''}
                onChange={this.handleChange}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Sub segment of</ControlLabel>
              <FormControl
                name="subOf"
                componentClass="select"
                value={this.state.subOf || ''}
                onChange={this.handleChange}
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
                name="color"
                type="color"
                value={this.state.color}
                onChange={this.handleChange}
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
        </FlexItem>
      </FlexContent>
    );
  }

  render() {
    return (
      <SegmentWrapper>
        <FlexContent>
          <FlexItem>
            <SegmentTitle>Filters</SegmentTitle>
            {this.renderConditions()}
            <ContentSpace />
            {this.renderForm()}
          </FlexItem>
        </FlexContent>
      </SegmentWrapper>
    );
  }
}

export default SegmentsForm;
