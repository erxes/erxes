/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';

const DragHandle = SortableHandle(() => (
  <span className="drag-handler">::::</span>
));

const SortableItem = SortableElement(({ field, isChecked }) => (
  <li>
    <DragHandle />
    <input type="checkbox" id={field._id} checked={isChecked} />
    <span>{field.label}</span>
  </li>
));

const SortableList = SortableContainer(({ fields, config }) => {
  const configMap = {};

  config.forEach(config => {
    configMap[config.name] = true;
  });

  return (
    <ul style={{ listStyleType: 'none' }}>
      {fields.map((field, index) => (
        <SortableItem
          key={index}
          index={index}
          field={field}
          isChecked={configMap[field.name]}
        />
      ))}
    </ul>
  );
});

class ManageColumns extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);

    this.state = {
      fields: props.fields
    };
  }

  onSubmit(e) {
    e.preventDefault();

    const columnsConfig = [];

    this.state.fields.forEach((field, index) => {
      const element = document.getElementById(field._id);

      if (element.checked) {
        columnsConfig.push({
          order: index,
          name: field.name,
          label: field.label
        });
      }
    });

    this.props.save(columnsConfig);
  }

  onSortEnd({ oldIndex, newIndex }) {
    const reorderedFields = arrayMove(this.state.fields, oldIndex, newIndex);

    this.setState({
      fields: reorderedFields
    });
  }

  render() {
    const { config } = this.props;

    const content = (
      <form onSubmit={this.onSubmit} className="manage-columns">
        <button type="submit" className="action-btn btn btn-success">
          <i className="ion-checkmark-circled" /> Save changes
        </button>

        <SortableList
          fields={this.state.fields}
          config={config}
          onSortEnd={this.onSortEnd}
          useDragHandle
        />
      </form>
    );

    const breadcrumb = [{ title: 'Manage columns' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

ManageColumns.propTypes = {
  fields: PropTypes.array.isRequired,
  config: PropTypes.array,
  save: PropTypes.func.isRequired
};

export default ManageColumns;
