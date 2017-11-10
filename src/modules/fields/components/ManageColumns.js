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

const StyledLi = styled.li`
  background-color: #eee8f3;
  border-radius: 5px;
  margin-top: 5px;
  width: 100%;
  padding: 10px 20px;
  border: 1px dotted #ddd;
  margin-bottom: 2px;
  cursor: pointer;
`;

const StyledUl = styled.ul`
  padding: 0px;
  margin-left: 20px;
  margin-right: 20px;
  list-style-type: none;
`;

const Wrapper = styled.div`
  display: block;
  width: 100%;
  max-height: 70vh;
`;

const Footer = styled.div`
  width: 100%;
  text-align: right;
  padding-top: 20px;
  padding-bottom: 10px;
`;

const ColumnsWrapper = styled.div`
  overflow-y: scroll;
  max-height: 57vh;
  width: 100%;
  height: 80%;
`;

const SortableItem = SortableElement(({ field, isChecked }) => (
  <StyledLi>
    <DragHandle />
    <input type="checkbox" id={field._id} defaultChecked={isChecked} />
    <span>{field.label}</span>
  </StyledLi>
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
    <StyledUl>
      {fields.map((field, index) => (
        <SortableItem
          key={index}
          index={index}
          field={field}
          isChecked={configMap[field.name]}
        />
      ))}
    </StyledUl>
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
      <Wrapper>
        <h4>Manage Columns</h4>

        <form onSubmit={this.onSubmit}>
          <ColumnsWrapper>
            <SortableList
              fields={this.state.fields}
              config={config}
              onSortEnd={this.onSortEnd}
              useDragHandle
            />
          </ColumnsWrapper>

          <Footer>
            <Button type="button" btnStyle="simple" onClick={closeModal}>
              <Icon icon="close" />CANCEL
            </Button>

            <Button type="submit" onClick={closeModal} btnStyle="success">
              <Icon icon="checkmark" />SUBMIT
            </Button>
          </Footer>
        </form>
      </Wrapper>
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
