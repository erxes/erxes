import React, { PropTypes, Component } from 'react';
import {
  Form,
  ButtonGroup,
  Button,
  Table,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Panel,
} from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import Alert from 'meteor/erxes-notifier';
import Conditions from './Conditions.jsx';
import AddConditionButton from './AddConditionButton.jsx';


const propTypes = {
  fields: PropTypes.array.isRequired,
  create: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  segment: PropTypes.object,
};

class SegmentsForm extends Component {
  static generateRandomColorCode() {
    return `#${Math.random().toString(16).slice(2, 8)}`;
  }

  constructor(props) {
    super(props);

    this.state = props.segment ? props.segment : {
      name: '',
      description: '',
      color: SegmentsForm.generateRandomColorCode(),
      conditions: [],
      connector: 'any',
    };

    this.addCondition = this.addCondition.bind(this);
    this.changeCondition = this.changeCondition.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleConnectorChange = this.handleConnectorChange.bind(this);
    this.save = this.save.bind(this);
  }

  addCondition(condition) {
    this.setState({
      conditions: [
        ...this.state.conditions,
        condition,
      ],
    });
  }

  changeCondition(condition) {
    this.setState({
      conditions: this.state.conditions.map(c =>
        c.field === condition.field ? condition : c,
      ),
    });
  }

  removeCondition(conditionField) {
    this.setState({
      conditions: this.state.conditions.filter(c => c.field !== conditionField),
    });
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
    const { name, description, color, connector, conditions } = this.state;
    const params = { doc: { name, description, color, connector, conditions } };
    Object.assign(params, segment ? { id: segment._id } : {});

    submit(params, (error) => {
      if (error) {
        return Alert.error(error.reason);
      }

      const successMessage = segment
        ? 'Segment is successfully changed.'
        : 'New segment is successfully created.';
      Alert.success(successMessage);
      return FlowRouter.go('segments/list');
    });
  }

  render() {
    const { fields, segment } = this.props;
    const selectedFieldIds = this.state.conditions.map(c => c.field);

    // Change fields' selectedBy states
    // const changedFields = fields.map(field =>
    //   Object.assign(field, {
    //     selectedBy: selectedFieldIds.indexOf(field._id) > -1 ? 'all' : 'none',
    //   }),
    // );

    // Exclude fields that are already selected
    const changedFields = fields.filter(field => selectedFieldIds.indexOf(field._id) < 0);

    const breadcrumb = [
      { title: 'Segments', link: '/segments' },
      { title: segment ? 'Edit segment' : 'New segment' },
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>
            <Button bsStyle="link" href={FlowRouter.path('segments/list')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = (
      <div className="margined">
        <Row>
          <Col sm={5}>
            <Form>
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
                  value={this.state.description}
                  onChange={this.handleDescriptionChange}
                />
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
                      </FormControl> of the following conditions
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
                conditions={this.state.conditions}
                changeCondition={this.changeCondition}
                removeCondition={this.removeCondition}
              />
            </Panel>
          </Col>
          <Col sm={7}>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Brand</th>
                  <th>Integration</th>
                </tr>
              </thead>
            </Table>
          </Col>
        </Row>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

SegmentsForm.propTypes = propTypes;

export default SegmentsForm;
