import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  ControlLabel,
  FormGroup,
  FormControl,
  Button
} from 'modules/common/components';

const propTypes = {
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  field: PropTypes.object,
  groups: PropTypes.array.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PropertyForm extends Component {
  constructor(props) {
    super(props);

    let action = props.add;

    if (props.field) {
      action = props.edit;
    }

    this.state = {
      type: '',
      validation: '',
      text: '',
      description: '',
      optionValue: '',
      groupId: '',
      options: [],
      add: false,
      hasOptions: false,
      action
    };

    this.handleAddOption = this.handleAddOption.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.handleSaveOption = this.handleSaveOption.bind(this);
    this.onOptionValueChange = this.onOptionValueChange.bind(this);
    this.renderButtonOrInput = this.renderButtonOrInput.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleCancelAddingOption = this.handleCancelAddingOption.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.field) {
      this.setState({
        ...nextProps.field,
        groupId: nextProps.field.groupId || nextProps.groups[0]._id
      });
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const {
      type,
      validation,
      text,
      description,
      groupId,
      options
    } = this.state;

    const doc = {
      type,
      validation,
      text,
      description,
      groupId,
      options,
      order: 1
    };

    this.state.action(
      this.props.field ? { _id: this.props.field._id, doc } : { doc }
    );

    this.context.closeModal();
  }

  onFieldChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.setState(
      (name === 'type' && value === 'select') ||
      value === 'check' ||
      value === 'radio'
        ? { hasOptions: true, [name]: value }
        : { hasOptions: false, [name]: value }
    );
  }

  handleAddOption() {
    this.setState({ add: true });
  }

  handleCancelAddingOption() {
    this.setState({ add: false, optionValue: '' });
  }

  handleSaveOption() {
    this.state.options.push(this.state.optionValue);
    this.handleCancelAddingOption();
  }

  onOptionValueChange(e) {
    this.setState({ optionValue: e.target.value });
  }

  renderButtonOrInput() {
    if (this.state.add) {
      return (
        <div>
          <FormControl
            onChange={this.onOptionValueChange}
            value={this.state.optionValue}
            autoFocus
          />
          <Button type="success" onClick={this.handleSaveOption}>
            Save
          </Button>
          <Button type="success" onClick={this.handleCancelAddingOption}>
            Cancel
          </Button>
        </div>
      );
    }

    return <Button onClick={this.handleAddOption}> Add Option </Button>;
  }

  renderOptions() {
    return (
      this.state.hasOptions && (
        <ul>
          {this.state.options.map((option, index) => {
            return <li key={index}>{option}</li>;
          })}
          {this.renderButtonOrInput()}
        </ul>
      )
    );
  }

  render() {
    const { groups } = this.props;
    const { validation, text, description, groupId } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel htmlFor="type">Type:</ControlLabel>

          <FormControl
            name="type"
            componentClass="select"
            value={groupId}
            onChange={this.onFieldChange}
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
            <option value="email">Email</option>
            <option value="firstName">First name</option>
            <option value="lastName">Last name</option>
          </FormControl>
        </FormGroup>
        {this.renderOptions()}

        <FormGroup>
          <ControlLabel htmlFor="validation">Validation:</ControlLabel>

          <FormControl
            name="validation"
            componentClass="select"
            value={validation}
            onChange={this.onFieldChange}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="text">Text:</ControlLabel>
          <FormControl
            type="text"
            name="text"
            value={text}
            onChange={this.onFieldChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            value={description}
            onChange={this.onFieldChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Group:</ControlLabel>
          <FormControl
            name="groupId"
            componentClass="select"
            onChange={this.onFieldChange}
            value={groupId}
          >
            {groups.map(group => {
              return (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              );
            })}
          </FormControl>
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

PropertyForm.contextTypes = contextTypes;
PropertyForm.propTypes = propTypes;

export default PropertyForm;
