import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  ControlLabel,
  Form,
  FormGroup,
  FormControl,
  Button,
  Icon
} from 'modules/common/components';
import { TypeList, Actions } from '../styles';
import { ModalFooter } from 'modules/common/styles/main';

const propTypes = {
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  field: PropTypes.object,
  groups: PropTypes.array.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class PropertyForm extends Component {
  constructor(props) {
    super(props);

    let action = props.add;

    let doc = {
      options: [],
      type: '',
      hasOptions: false
    };

    if (props.field) {
      action = props.edit;

      doc = {
        ...doc,
        type: props.field.type
      };

      if (
        props.field.type === 'select' ||
        props.field.type === 'radio' ||
        props.field.type === 'check'
      ) {
        doc = {
          type: props.field.type,
          hasOptions: true,
          options: Object.assign([], props.field.options || [])
        };
      }
    }

    this.state = {
      ...doc,
      action
    };

    this.handleAddOption = this.handleAddOption.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.handleSaveOption = this.handleSaveOption.bind(this);
    this.renderButtonOrElement = this.renderButtonOrElement.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.handleCancelAddingOption = this.handleCancelAddingOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(args) {
    const groupId = args.groupId;
    const validation = args.validation;
    const text = args.text;
    const description = args.description;
    const type = args.type;

    const { options } = this.state;

    const doc = {
      type,
      validation,
      text,
      description,
      options,
      groupId
    };

    this.state.action(
      this.props.field ? { _id: this.props.field._id, doc } : { doc }
    );

    this.context.closeModal();
  }

  onTypeChange(e) {
    const value = e.target.value;

    let doc = { hasOptions: false, options: [] };

    if (value === 'select' || value === 'check' || value === 'radio') {
      doc = { hasOptions: true };
    }

    this.setState({ type: value, ...doc });
  }

  handleAddOption() {
    this.setState({ add: true });
  }

  handleCancelAddingOption() {
    this.setState({ add: false });
  }

  handleSaveOption() {
    const { options } = this.state;
    const optionValue = document.getElementById('optionValue').value;

    this.setState({ options: [...options, optionValue] });
    this.handleCancelAddingOption();
  }

  handleRemoveOption(index) {
    const { options } = this.state;

    this.setState({
      options: options.splice(index, 1) && options
    });
  }

  renderButtonOrElement() {
    const { __ } = this.context;
    if (this.state.add) {
      return (
        <Fragment>
          <FormControl
            id="optionValue"
            autoFocus
            onKeyPress={e => {
              if (e.key === 'Enter') this.handleSaveOption();
            }}
          />
          <Actions>
            <Button
              type="success"
              icon="cancel-1"
              btnStyle="simple"
              size="small"
              onClick={this.handleSaveOption}
            >
              Cancel
            </Button>
            <Button
              type="success"
              btnStyle="success"
              size="small"
              icon="checked-1"
              onClick={this.handleSaveOption}
            >
              Save
            </Button>
          </Actions>
        </Fragment>
      );
    }

    return (
      <Button onClick={this.handleAddOption} size="small" icon="add">
        {__('Add an option')}
      </Button>
    );
  }

  renderOption(option, index) {
    return (
      <li key={index}>
        {option}
        <Icon icon="cancel-1" onClick={() => this.handleRemoveOption(index)} />
      </li>
    );
  }

  renderOptions() {
    if (!this.state.hasOptions) return null;

    return (
      <TypeList>
        {this.state.options.map((option, index) =>
          this.renderOption(option, index)
        )}
        {this.renderButtonOrElement()}
      </TypeList>
    );
  }

  render() {
    const { groups, field = {} } = this.props;
    const { type } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel htmlFor="text">Name:</ControlLabel>
          <FormControl
            type="text"
            name="text"
            validations="isValue"
            validationError="Please enter a name"
            value={field.text || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            validations={{}}
            value={field.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Group:</ControlLabel>
          <FormControl
            name="groupId"
            componentClass="select"
            validations="isValue"
            validationError="Please select a group"
            value={field.groupId}
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

        <FormGroup>
          <ControlLabel htmlFor="type">Type:</ControlLabel>

          <FormControl
            componentClass="select"
            name="type"
            value={type}
            validations="isValue"
            validationError="Please select a type"
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
          </FormControl>
        </FormGroup>
        {this.renderOptions()}

        <FormGroup>
          <ControlLabel htmlFor="validation">Validation:</ControlLabel>

          <FormControl
            componentClass="select"
            name="validation"
            validations="isValue"
            validationError="Please select a validation type"
            value={field.validation || ''}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

PropertyForm.contextTypes = contextTypes;
PropertyForm.propTypes = propTypes;

export default PropertyForm;
