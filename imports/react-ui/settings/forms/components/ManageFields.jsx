/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes, Component } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';

const propTypes = {
  addField: PropTypes.func.isRequired,
};

class ManageFields extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.addField({
      type: document.getElementById('type').value,
      name: document.getElementById('name').value,
      text: document.getElementById('text').value,
      description: document.getElementById('description').value,
      isRequired: document.getElementById('isRequired').checked,
    });
  }

  renderForm() {
    return (
      <form className="margined" onSubmit={this.onSubmit}>
        <p className="form-group">
          <label className="control-label" htmlFor="type">Төрөл:</label>

          <select id="type" className="form-control">
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
          </select>
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="name">Name:</label>
          <input id="name" className="form-control" />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="text">Text:</label>
          <input id="text" className="form-control" />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="description">Description:</label>
          <input id="description" className="form-control" />
        </p>

        <p className="form-group">
          <label className="control-label" htmlFor="isRequired">Is required:</label>
          <input id="isRequired" type="checkbox" className="form-control" />
        </p>

        <button type="submit">Add</button>
      </form>
    );
  }

  render() {
    const content = (
      <div className="form-builder">
        <div className="col-sm-4">
          {this.renderForm()}
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

ManageFields.propTypes = propTypes;

export default ManageFields;
