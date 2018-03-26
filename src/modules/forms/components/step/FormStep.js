import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormGroup, FormControl, Button } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { colors } from 'modules/common/styles';
import { FlexItem, LeftItem, Preview, Title } from './style';

const Fields = styled.ul`
  list-style: none;
  padding: 0;

  button {
    color: ${colors.colorSecondary};
    font-weight: 500;
  }
`;

const FlexColumn = styled.div`
  display: flex;
  min-width: 43.33333%;
  flex-direction: column;
  justify-content: space-between;

  ${LeftItem} {
    flex: 1;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  background: #fafafa;
  height: 50px;
  border-top: 1px solid #eee;

  label {
    margin-bottom: 0;
    margin-right: 20px;
  }
`;

const propTypes = {
  type: PropTypes.string,
  calloutTitle: PropTypes.string,
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
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

    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeValidation = this.onChangeValidation.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeOptions = this.onChangeOptions.bind(this);
    this.onChangeIsRequired = this.onChangeIsRequired.bind(this);

    this.footerActions = this.footerActions.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onFieldEdit = this.onFieldEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ fields: nextProps.fields });
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

  onChangeOptions(e) {
    this.setChanges('options', e.target.value.split('\n'));
  }

  onChangeIsRequired(e) {
    this.setChanges('isRequired', e.target.checked);
  }

  renderPreview() {
    const {
      calloutTitle,
      bodyValue,
      btnText,
      color,
      theme,
      image,
      type,
      onChange
    } = this.props;

    if (type === 'shoutbox') {
      return (
        <ShoutboxPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
          onChange={onChange}
        />
      );
    }

    if (type === 'popup') {
      return (
        <PopupPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={this.state.fields}
          onFieldEdit={this.onFieldEdit}
          onChange={onChange}
        />
      );
    }

    return (
      <EmbeddedPreview
        calloutTitle={calloutTitle}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
        fields={this.state.fields}
        onFieldEdit={this.onFieldEdit}
        onChange={onChange}
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
          onChange={this.onChangeIsRequired}
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
        <Title htmlFor="type">Options:</Title>

        <FormControl
          id="options"
          componentClass="textarea"
          value={(editingField.options || []).join('\n')}
          onChange={this.onChangeOptions}
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
          <Title htmlFor="type">Type:</Title>

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
          <Title htmlFor="validation">Validation:</Title>

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
          <Title htmlFor="text">Text:</Title>
          <FormControl
            id="text"
            type="text"
            value={editingField.text || ''}
            onChange={this.onChangeText}
          />
        </FormGroup>

        <FormGroup>
          <Title htmlFor="description">Description:</Title>
          <FormControl
            id="description"
            componentClass="textarea"
            value={editingField.description || ''}
            onChange={this.onChangeDescription}
          />
        </FormGroup>

        {this.renderOptionsTextArea()}
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
