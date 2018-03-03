/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Icon, FormControl } from 'modules/common/components';
import { colors } from 'modules/common/styles';

const SortItem = styled.li`
  background: ${colors.colorWhite};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  display: block;
  padding: 10px 20px 10px 40px;
  margin-bottom: 5px;
  z-index: 2000;
  list-style: none;
  position: relative;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 8px ${colors.shadowPrimary};

  &:last-child {
    margin: 0;
  }
`;

const SortableWrapper = styled.ul`
  padding: 0px;
  margin: 0;
  list-style-type: none;
  max-height: 420px;
  overflow: auto;

  ${SortItem} {
    box-shadow: none;
  }

  label {
    margin: 0;
  }
`;

const DragHandler = styled.div`
  cursor: row-resize;
  position: absolute;
  display: flex;
  left: 10px;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 20px;
  align-items: center;
  justify-content: center;

  i {
    font-size: 24px;
    color: ${colors.colorLightGray};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${colors.bgActive};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  margin-bottom: 5px;

  > span {
    text-transform: uppercase;
    padding: 5px 20px 5px 40px;
    font-weight: bold;
  }
`;

const Footer = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const DragHandle = SortableHandle(() => (
  <DragHandler>
    <Icon icon="android-more-vertical" />
  </DragHandler>
));

const SortableItem = SortableElement(({ field, isChecked }) => (
  <SortItem>
    <DragHandle />
    <span>{field.label}</span>
    <FormControl
      id={String(field._id)}
      defaultChecked={isChecked}
      componentClass="checkbox"
    />
  </SortItem>
));

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
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
    const { __ } = this.context;

    const closeModal = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.onSubmit}>
        <Header>
          <span>{__('Column name')}</span>
          <span>{__('Visible')}</span>
        </Header>

        <SortableList
          fields={this.state.fields}
          config={config}
          lockAxis="y"
          onSortEnd={this.onSortEnd}
          useDragHandle
        />

        <Footer>
          <Button
            type="button"
            btnStyle="simple"
            onClick={closeModal}
            icon="close"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={closeModal}
            btnStyle="success"
            icon="checkmark"
          >
            Submit
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
