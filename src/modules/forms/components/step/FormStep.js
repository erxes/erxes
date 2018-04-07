import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  FormGroup,
  FormControl,
  Button,
  ControlLabel
} from 'modules/common/components';
import {
  EmbeddedPreview,
  PopupPreview,
  ShoutboxPreview,
  DropdownPreview,
  SlideLeftPreview,
  SlideRightPreview
} from './preview';
import { colors } from 'modules/common/styles';
import { FlexItem, FlexColumn, LeftItem, Footer, Preview } from './style';

const Fields = styled.ul`
  list-style: none;
  padding: 0;

  button {
    color: ${colors.colorSecondary};
    font-weight: 500;
  }
`;

const propTypes = {
  type: PropTypes.string,
  formTitle: PropTypes.string,
  formBtnText: PropTypes.string,
  formDesc: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  onChange: PropTypes.func,
  fields: PropTypes.array
};

const editingFieldDefaultValue = {
  isRequired: false
};

class FormStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: props.fields,
      chosenFieldType: null,
      editingField: editingFieldDefaultValue
    };

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeType = this.onChangeType.bind(this);

    this.footerActions = this.footerActions.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onFieldEdit = this.onFieldEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ fields: nextProps.fields });
  }

  onChangeType(e) {
    this.setState({ chosenFieldType: e.target.value });
    this.setChanges('type', e.target.value);
  }

  onFieldEdit(field) {
    this.setState({ editingField: field });
  }

  onChangeFunction(name, value) {
    this.setChanges(name, value);
  }

  onChangeState(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
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
      order: 0,
      isRequired: editingField.isRequired
    };

    // newly created field to fields state
    this.state.fields.push({
      _id: Math.random().toString(),
      ...doc
    });

    this.setState({ fields: this.state.fields });
  }

  setChanges(attributeName, value) {
    const { editingField } = this.state;

    editingField[attributeName] = value;

    this.setState({ editingField });
  }

  renderPreview() {
    const { type } = this.props;

    if (type === 'shoutbox') {
      return (
        <ShoutboxPreview
          {...this.props}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
        />
      );
    }

    if (type === 'popup') {
      return (
        <PopupPreview
          {...this.props}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
        />
      );
    }

    if (type === 'dropdown') {
      return (
        <DropdownPreview
          {...this.props}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
        />
      );
    }

    if (type === 'slideInLeft') {
      return (
        <SlideLeftPreview
          {...this.props}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
        />
      );
    }

    if (type === 'slideInRight') {
      return (
        <SlideRightPreview
          {...this.props}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
        />
      );
    }

    return (
      <EmbeddedPreview
        {...this.props}
        fields={this.state.fields}
        onFieldEdit={this.onFieldEdit}
      />
    );
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
        reset();

        this.props.onChange('fields', fields);
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

  footerActions() {
    const { __ } = this.context;

    return (
      <Footer>
        <FormControl
          checked={this.state.editingField.isRequired || false}
          id="isRequired"
          componentClass="checkbox"
          onChange={e => this.onChangeFunction('isRequired', e.target.checked)}
        >
          {__('This item is required')}
        </FormControl>

        {this.renderButtons()}
      </Footer>
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
          onChange={e =>
            this.onChangeFunction('options', e.target.value.split('\n'))
          }
        />
      </FormGroup>
    );
  }

  renderOptions() {
    const editingField = this.state.editingField;
    const { __ } = this.context;

    return (
      <Fields>
        <FormGroup>
          <ControlLabel>Form title</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formTitle}
            onChange={e => this.onChangeState('formTitle', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Form description</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formDesc}
            onChange={e => this.onChangeState('formDesc', e.target.value)}
          />
        </FormGroup>

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
            onChange={e => this.onChangeFunction('validation', e.target.value)}
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
            onChange={e => this.onChangeFunction('text', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="description">Description:</ControlLabel>
          <FormControl
            id="description"
            componentClass="textarea"
            value={editingField.description || ''}
            onChange={e => this.onChangeFunction('description', e.target.value)}
          />
        </FormGroup>

        {this.renderOptionsTextArea()}

        <FormGroup>
          <ControlLabel>Form button text</ControlLabel>
          <FormControl
            id="form-btn-text"
            value={this.props.formBtnText}
            onChange={e => this.onChangeState('formBtnText', e.target.value)}
          />
        </FormGroup>
      </Fields>
    );
  }

  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>{this.renderOptions()}</LeftItem>
          {this.footerActions()}
        </FlexColumn>

        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

FormStep.propTypes = propTypes;
FormStep.contextTypes = {
  __: PropTypes.func
};

export default FormStep;
