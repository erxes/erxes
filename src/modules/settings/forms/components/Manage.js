/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ControlLabel,
  Button,
  FormGroup,
  FormControl
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import FieldsPreview from './FieldsPreview';
import { ContentBox, BuildFooter } from '../styles';

const editingFieldDefaultValue = {
  isRequired: false
};

class Manage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: props.fields,
      chosenFieldType: null,
      editingField: editingFieldDefaultValue
    };

    // attribute change events
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeValidation = this.onChangeValidation.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeOptions = this.onChangeOptions.bind(this);
    this.onChangeIsRequired = this.onChangeIsRequired.bind(this);

    this.onSubmit = this.onSubmit.bind(this);
    this.onFieldEdit = this.onFieldEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ fields: nextProps.fields });
  }

  onSubmit(e) {
    e.preventDefault();

    const editingField = this.state.editingField;

    const doc = {
      type: editingField.type,
      validation: editingField.validation,
      text: editingField.text,
      description: editingField.description,
      options: editingField.options,
      isRequired: editingField.isRequired
    };

    if (editingField._id) {
      return this.props.editField(editingField._id, doc);
    }

    return this.props.addField(doc, fieldId => {
      // newly created field to fields state
      doc._id = fieldId;

      this.state.fields.push(doc);

      this.setState({ fields: this.state.fields });
    });
  }

  onFieldEdit(field) {
    this.setState({ editingField: field });
  }

  onChangeType(e) {
    this.setState({ chosenFieldType: e.target.value });
    this.setChanges('type', e.target.value);
  }

  onChangeValidation(e) {
    this.setChanges('validation', e.target.value);
  }

  onChangeText(e) {
    this.setChanges('text', e.target.value);
  }

  onChangeDescription(e) {
    this.setChanges('description', e.target.value);
  }

  onChangeOptions(e) {
    this.setChanges('options', e.target.value.split('\n'));
  }

  onChangeIsRequired(e) {
    this.setChanges('isRequired', e.target.checked);
  }

  setChanges(attributeName, value) {
    const { editingField } = this.state;

    editingField[attributeName] = value;

    this.setState({ editingField });
  }

  renderButtons() {
    const _id = this.state.editingField._id;

    if (_id) {
      // reset editing field state
      const reset = () => {
        this.setState({ editingField: editingFieldDefaultValue });
      };

      const onDelete = e => {
        e.preventDefault();

        // remove field from state
        const fields = this.state.fields.filter(field => field._id !== _id);

        this.setState({ fields });

        // remove field from db
        this.props.deleteField(_id);

        reset();
      };

      return (
        <Button.Group>
          <Button
            size="small"
            btnStyle="danger"
            onClick={onDelete}
            icon="close"
          >
            Delete
          </Button>
          <Button size="small" btnStyle="primary" onClick={reset} icon="plus">
            New
          </Button>
          <Button
            size="small"
            onClick={this.onSubmit}
            btnStyle="success"
            icon="checkmark"
          >
            Save
          </Button>
        </Button.Group>
      );
    }

    return (
      <Button
        size="small"
        onClick={this.onSubmit}
        btnStyle="primary"
        icon="plus"
      >
        Add
      </Button>
    );
  }

  renderOptionsTextArea() {
    const { editingField, chosenFieldType } = this.state;

    if (
      !['select', 'check', 'radio'].includes(
        chosenFieldType || editingField.type
      )
    ) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel htmlFor="type">Options:</ControlLabel>

        <FormControl
          id="options"
          componentClass="textarea"
          value={(editingField.options || []).join('\n')}
          onChange={this.onChangeOptions}
        />
      </FormGroup>
    );
  }

  renderForm() {
    const editingField = this.state.editingField;
    const { __ } = this.context;

    return (
      <ContentBox>
        <FormGroup>
          <ControlLabel htmlFor="type">Type:</ControlLabel>

          <FormControl
            id="type"
            componentClass="select"
            value={editingField.type || ''}
            onChange={this.onChangeType}
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
            <option value="email">Email</option>
            <option value="firstName">{__('First name')}</option>
            <option value="lastName">{__('Last name')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="validation">Validation:</ControlLabel>

          <FormControl
            id="validation"
            componentClass="select"
            value={editingField.validation || ''}
            onChange={this.onChangeValidation}
          >
            <option />
            <option value="email">{__('Email')}</option>
            <option value="number">{__('Number')}</option>
            <option value="date">{__('Date')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="text">Text:</ControlLabel>
          <FormControl
            id="text"
            type="text"
            value={editingField.text || ''}
            onChange={this.onChangeText}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            id="description"
            componentClass="textarea"
            value={editingField.description || ''}
            onChange={this.onChangeDescription}
          />
        </FormGroup>

        {this.renderOptionsTextArea()}
      </ContentBox>
    );
  }

  render() {
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Manage fields') }];

    const Sidebar = Wrapper.Sidebar;

    const footerActions = (
      <BuildFooter>
        <FormControl
          checked={this.state.editingField.isRequired || false}
          id="isRequired"
          componentClass="checkbox"
          onChange={this.onChangeIsRequired}
        >
          {__('This item is required')}
        </FormControl>

        {this.renderButtons()}
      </BuildFooter>
    );

    const preview = (
      <Sidebar
        half
        full
        header={<Sidebar.Header>{__('Preview')}</Sidebar.Header>}
      >
        <FieldsPreview
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
          onSort={this.props.onSort}
        />
      </Sidebar>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        rightSidebar={preview}
        actionBar={<Wrapper.ActionBar left={__('Build')} />}
        footer={footerActions}
        content={this.renderForm()}
      />
    );
  }
}

Manage.propTypes = {
  addField: PropTypes.func.isRequired,
  editField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired // eslint-disable-line
};

Manage.contextTypes = {
  __: PropTypes.func
};

export default Manage;
