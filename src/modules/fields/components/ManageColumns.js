/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import { Button, Icon } from 'modules/common/components';
import styled from 'styled-components';

const DragHandle = SortableHandle(() => <Icon icon="grid" />);

const SortItem = styled.li`
  background-color: #eee8f3;
  border-radius: 5px;
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  z-index: 2000;
  list-style: none;

  > i,
  > input {
    margin-right: 10px !important;
  }
`;

const SortableWrapper = styled.ul`
  padding: 0px;
  margin: 0;
  list-style-type: none;
`;

const Footer = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const SortableItem = SortableElement(({ field, isChecked }) => (
  <SortItem>
    <DragHandle />
    <input type="checkbox" id={field._id} defaultChecked={isChecked} />
    <span>{field.label}</span>
  </SortItem>
));

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

const SortableList = SortableContainer(({ fields, config }) => {
  const configMap = {};

  config.forEach(config => {
    configMap[config.name] = true;
  });

  return (
    <SortableWrapper>
      {fields.map((field, index) => (
        <SortableItem
          key={index}
          index={index}
          field={field}
          isChecked={configMap[field.name]}
        />
      ))}
    </SortableWrapper>
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

    const closeModal = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.onSubmit}>
        <SortableList
          fields={this.state.fields}
          config={config}
          onSortEnd={this.onSortEnd}
          useDragHandle
        />

        <Footer>
          <Button type="button" btnStyle="simple" onClick={closeModal}>
            <Icon icon="close" /> Cancel
          </Button>

          <Button type="submit" onClick={closeModal} btnStyle="success">
            <Icon icon="checkmark" /> Submit
          </Button>
        </Footer>
      </form>
    );
  }
}

ManageColumns.propTypes = {
  fields: PropTypes.array.isRequired,
  config: PropTypes.array,
  save: PropTypes.func.isRequired
};

ManageColumns.contextTypes = contextTypes;

export default ManageColumns;
