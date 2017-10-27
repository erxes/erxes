import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  ButtonGroup,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Panel
} from 'react-bootstrap';
import { Button, Icon } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import Conditions from './Conditions';
import AddConditionButton from './AddConditionButton';

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

  render() {
    const { contentType, fields, segment } = this.props;
    const selectedFieldIds = this.state.conditions.map(c => c.field);

    // Exclude fields that are already selected
    const changedFields = fields.filter(
      field => selectedFieldIds.indexOf(field._id) < 0
    );

    const breadcrumb = [
      { title: 'Segments', link: `/segments/${contentType}` },
      { title: segment ? 'Edit segment' : 'New segment' }
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button btnStyle="success" onClick={this.save}>
              <Icon icon="checkmark" /> Save
            </Button>
            <Button btnStyle="simple" href={`/segments/${contentType}`}>
              <Icon icon="close" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = (
      <div className="margined">
        <Row>
          <Col sm={5}>
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
          </Col>
          <Col sm={7}>
            <Panel
              header={
                <div className="clearfix">
                  <div className="pull-left">Conditions</div>
                  <div className="pull-right">
                    <Form inline>
                      <FormControl
                        componentClass="select"
                        value={this.state.connector}
                        onChange={this.handleConnectorChange}
                      >
                        <option value="any">any</option>
                        <option value="all">all</option>
                      </FormControl>{' '}
                      of the following conditions
                    </Form>
                  </div>
                </div>
              }
              footer={
                <AddConditionButton
                  fields={changedFields}
                  addCondition={this.addCondition}
                />
              }
            >
              <Conditions
                parentSegmentId={this.state.subOf}
                conditions={this.state.conditions}
                changeCondition={this.changeCondition}
                removeCondition={this.removeCondition}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

SegmentsForm.propTypes = propTypes;

export default SegmentsForm;
