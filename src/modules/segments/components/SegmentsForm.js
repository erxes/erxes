import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import {
  Button,
  Icon,
  ControlLabel,
  FormGroup,
  FormControl
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { FlexContent, FlexItem, ContentSpace } from 'modules/layout/styles';
import Conditions from './Conditions';
import AddConditionButton from './AddConditionButton';
import {
  SegmentWrapper,
  ConditionWrapper,
  SegmentTitle,
  SegmentContainer,
  SegmentResult,
  ResultCount
} from './styles';

const propTypes = {
  contentType: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  create: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  segment: PropTypes.object,
  headSegments: PropTypes.array.isRequired
};

class SegmentsForm extends Component {
  static generateRandomColorCode() {
    return `#${Math.random()
      .toString(16)
      .slice(2, 8)}`;
  }

  constructor(props) {
    super(props);

    this.state = props.segment
      ? props.segment
      : {
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
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleConnectorChange = this.handleConnectorChange.bind(this);
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

  handleNameChange(e) {
    e.preventDefault();
    this.setState({ name: e.target.value });
  }

  handleDescriptionChange(e) {
    e.preventDefault();
    this.setState({ description: e.target.value });
  }

  handleColorChange(e) {
    e.preventDefault();
    this.setState({ color: e.target.value });
  }

  handleConnectorChange(e) {
    e.preventDefault();
    this.setState({ connector: e.target.value });
  }

  save(e) {
    e.preventDefault();

    const { segment, create, edit } = this.props;

    const submit = segment ? edit : create;
    const {
      name,
      description,
      subOf,
      color,
      connector,
      conditions
    } = this.state;
    const params = { doc: { name, description, color, connector, conditions } };

    if (subOf) {
      params.doc.subOf = subOf;
    }

    Object.assign(params, segment ? { id: segment._id } : {});

    submit(params);
  }

  renderConditions() {
    const { contentType, fields } = this.props;
    const selectedFieldIds = this.state.conditions.map(c => c.field);

    // Exclude fields that are already selected
    const changedFields = fields.filter(
      field => selectedFieldIds.indexOf(field._id) < 0
    );

    return (
      <ConditionWrapper>
        <FormGroup>
          Users who match{' '}
          <FormControl
            componentClass="select"
            value={this.state.connector}
            onChange={this.handleConnectorChange}
          >
            <option value="any">any</option>
            <option value="all">all</option>
          </FormControl>{' '}
          of the below conditions
        </FormGroup>
        <Conditions
          contentType={contentType}
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
        <FlexItem count={3}>
          <Form onSubmit={this.save}>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                name="name"
                type="text"
                required
                value={this.state.name}
                onChange={this.handleNameChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                name="description"
                type="text"
                value={this.state.description || ''}
                onChange={this.handleDescriptionChange}
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
                onChange={this.handleColorChange}
              />
            </FormGroup>
          </Form>
        </FlexItem>
        <FlexItem count={2} />
      </FlexContent>
    );
  }

  render() {
    const { contentType, segment } = this.props;

    const breadcrumb = [
      { title: 'Segments', link: `/segments/${contentType}` },
      { title: segment ? 'Edit segment' : 'New segment' }
    ];

    const content = (
      <SegmentWrapper>
        <FlexContent>
          <FlexItem count={3}>
            <SegmentContainer>
              <SegmentTitle>Filters</SegmentTitle>

              {this.renderConditions()}
              <ContentSpace />
              {this.renderForm()}
            </SegmentContainer>
          </FlexItem>

          <SegmentResult count={2}>
            <ResultCount>
              <Icon icon="person-stalker" /> 999
            </ResultCount>
            User(s) will recieve this message
          </SegmentResult>
        </FlexContent>
      </SegmentWrapper>
    );

    const actionFooter = (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to={`/segments/${contentType}`}>
              <Button size="small" btnStyle="simple">
                <Icon icon="close" /> Cancel
              </Button>
            </Link>
            <Button size="small" btnStyle="success" onClick={this.save}>
              <Icon icon="checkmark" /> Save
            </Button>
          </Button.Group>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        footer={actionFooter}
      />
    );
  }
}

SegmentsForm.propTypes = propTypes;

export default SegmentsForm;
