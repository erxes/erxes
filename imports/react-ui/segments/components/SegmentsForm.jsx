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
import { Customers } from '/imports/api/customers/customers';
import { Wrapper } from '/imports/react-ui/layout/components';
import Alert from 'meteor/erxes-notifier';
import Conditions from './Conditions.jsx';
import AddConditionButton from './AddConditionButton.jsx';


const schema = Customers.simpleSchema().schema();
const fields = Object.keys(schema).map((key) => {
  const field = schema[key];
  return {
    _id: key,
    title: field.label || key,
    selectedBy: 'none',
  };
});


const propTypes = {
  create: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  segment: PropTypes.object,
};

class SegmentsForm extends Component {
  constructor(props) {
    super(props);

    this.state = props.segment ? props.segment : {
      name: '',
      description: '',
      color: '#000',
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
    const { segment } = this.props;

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
                  fields={fields}
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
