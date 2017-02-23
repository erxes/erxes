/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes, Component } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';
import FieldsPreview from './FieldsPreview.jsx';

const editingFieldDefaultValue = {
  isRequired: false,
};

class ManageFields extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingField: editingFieldDefaultValue,
    };

    // attribute change events
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
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
      name: editingField.name,
      text: editingField.text,
      description: editingField.text,
      options: editingField.options,
      isRequired: editingField.isRequired,
    };

    if (editingField._id) {
      return this.props.editField(editingField._id, doc);
    }

    return this.props.addField(doc);
  }

  onFieldEdit(field) {
    this.setState({ editingField: field });
  }

  onChangeType(e) {
    this.setChanges('type', e.target.value);
  }

  onChangeName(e) {
    this.setChanges('name', e.target.value);
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

  setChanges(fieldName, value) {
    this.state.editingField[fieldName] = value;
    this.setState({ editingField: this.state.editingField });
  }

  renderButtons() {
    const _id = this.state.editingField._id;

    if (_id) {
      // reset editing field state
      const reset = () => {
        this.setState({ editingField: editingFieldDefaultValue });
      };

      const onDelete = () => {
        this.props.deleteField(_id);
        reset();
      };

      return (
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-danger" onClick={onDelete}>
            Delete
          </button>

          <button type="button" className="btn btn-sm btn-primary" onClick={reset}>
            Create new
          </button>

          <button type="submit" className="btn btn-sm btn-success">
            Save changes
          </button>
        </div>
      );
    }

    return <button type="submit" className="btn btn-sm btn-success">Add</button>;
  }

  renderForm() {
    const editingField = this.state.editingField;

    return (
      <form className="margined" onSubmit={this.onSubmit}>
        <p className="form-group">
          <label className="control-label" htmlFor="type">Type:</label>

          <select
            id="type"
            className="form-control"
            value={editingField.type || ''}
            onChange={this.onChangeType}
          >

            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
          </select>
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="name">Name:</label>
          <input
            id="name"
            className="form-control"
            value={editingField.name || ''}
            onChange={this.onChangeName}
          />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="text">Text:</label>
          <input
            id="text"
            className="form-control"
            value={editingField.text || ''}
            onChange={this.onChangeText}
          />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="description">Description:</label>
          <input
            id="description"
            className="form-control"
            value={editingField.description || ''}
            onChange={this.onChangeDescription}
          />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="type">Options:</label>

          <textarea
            id="options"
            className="form-control"
            value={(editingField.options || []).join('\n')}
            onChange={this.onChangeOptions}
          />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="isRequired">Is required:</label>
          <input
            id="isRequired"
            type="checkbox"
            className="form-control"
            onChange={this.onChangeIsRequired}
            checked={editingField.isRequired || false}
          />
        </p>

        {this.renderButtons()}
      </form>
    );
  }

  render() {
    const content = (
      <div className="form-builder">
        <div className="col-sm-4">
          {this.renderForm()}
        </div>

        <div className="col-sm-8">
          <div className="margined">
            <FieldsPreview
              fields={this.props.fields}
              onFieldEdit={this.onFieldEdit}
              onSort={this.props.onSort}
            />
          </div>
        </div>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/forms' },
      { title: 'Forms' },
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
  fields: PropTypes.array.isRequired, // eslint-disable-line
};

export default ManageFields;
