import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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
  headSegments: PropTypes.array.isRequired,
  count: PropTypes.func.isRequired,
  total: PropTypes.object
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

    if (props.segment) {
      props.count(props.segment);
    }

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
    const { __ } = this.context;

    // Exclude fields that are already selected
    const changedFields = fields.filter(
      field => selectedFieldIds.indexOf(field._id) < 0
    );

    return (
      <Fragment>
        <ConditionWrapper>
          <FormGroup>
            {__('Users who match')}
            <FormControl
              componentClass="select"
              value={this.state.connector}
              onChange={this.handleConnectorChange}
            >
              <option value="any">{__('any')}</option>
              <option value="all">{__('all')}</option>
            </FormControl>
            {__('of the below conditions')}
          </FormGroup>
          <Conditions
            contentType={contentType}
            parentSegmentId={this.state.subOf}
            conditions={this.state.conditions}
            changeCondition={this.changeCondition}
            removeCondition={this.removeCondition}
          />
        </ConditionWrapper>
        <AddConditionButton
          fields={changedFields}
          addCondition={this.addCondition}
        />
      </Fragment>
    );
  }

  renderForm() {
    return (
      <FlexContent>
        <FlexItem count={3}>
          <form onSubmit={this.save}>
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
          </form>
        </FlexItem>
        <FlexItem count={2} />
      </FlexContent>
    );
  }

  render() {
    const { contentType, segment, total } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Segments'), link: `/segments/${contentType}` },
      { title: segment ? __('Edit segment') : __('New segment') }
    ];

    const content = (
      <SegmentWrapper>
        <FlexContent>
          <FlexItem count={3}>
            <SegmentContainer>
              <SegmentTitle>{__('Filters')}</SegmentTitle>

              {this.renderConditions()}
              <ContentSpace />
              {this.renderForm()}
            </SegmentContainer>
          </FlexItem>

          <SegmentResult>
            <ResultCount>
              <Icon icon="users" /> {total.byFakeSegment}
            </ResultCount>
            {__('User(s) will recieve this message')}
          </SegmentResult>
        </FlexContent>
      </SegmentWrapper>
    );

    const actionFooter = (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to={`/segments/${contentType}`}>
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>
            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              Save
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
SegmentsForm.contextTypes = {
  __: PropTypes.func
};

export default SegmentsForm;
