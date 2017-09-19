/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes, Component } from 'react';
import {
  Col,
  Row,
  FormGroup,
  ControlLabel,
  FormControl,
  Checkbox,
  ButtonGroup,
  Button,
} from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar';
import FieldsPreview from './FieldsPreview';

const editingFieldDefaultValue = {
  isRequired: false,
};

class ManageFields extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: props.fields,
      chosenFieldType: null,
      editingField: editingFieldDefaultValue,
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

  onSubmit(e) {
    e.preventDefault();

    const editingField = this.state.editingField;

    const doc = {
      type: editingField.type,
      validation: editingField.validation,
      text: editingField.text,
      description: editingField.description,
      options: editingField.options,
      isRequired: editingField.isRequired,
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
        <ButtonGroup>
          <Button bsSize="small" bsStyle="danger" onClick={onDelete}>
            Delete
          </Button>
          <Button bsSize="small" bsStyle="primary" onClick={reset}>
            New
          </Button>
          <Button bsSize="small" type="submit" bsStyle="success">
            Save
          </Button>
        </ButtonGroup>
      );
    }

    return (
      <ButtonGroup>
        <Button bsSize="small" type="submit" bsStyle="success">
          Add
        </Button>
      </ButtonGroup>
    );
  }

  renderOptionsTextArea() {
    const { editingField, chosenFieldType } = this.state;

    if (!['select', 'check', 'radio'].includes(chosenFieldType || editingField.type)) {
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

    return (
      <form onSubmit={this.onSubmit}>
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
            <option value="firstName">First name</option>
            <option value="lastName">Last name</option>
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
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
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
        <div className="flex-row">
          <FormGroup className="flex-item">
            <Checkbox
              id="isRequired"
              onChange={this.onChangeIsRequired}
              checked={editingField.isRequired || false}
            >
              Required:
            </Checkbox>
          </FormGroup>

          {this.renderButtons()}
        </div>
      </form>
    );
  }

  render() {
    const content = (
      <div className="form-builder margined">
        <Row>
          <Col sm={5} className="fixed">
            {this.renderForm()}
          </Col>

          <Col sm={7} xsOffset={5}>
            <FieldsPreview
              fields={this.state.fields}
              onFieldEdit={this.onFieldEdit}
              onSort={this.props.onSort}
            />
          </Col>
        </Row>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Forms', link: '/settings/forms' },
      { title: this.props.formTitle },
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

ManageFields.propTypes = {
  addField: PropTypes.func.isRequired,
  editField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  formTitle: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired, // eslint-disable-line
};

export default ManageFields;
