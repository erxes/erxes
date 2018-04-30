/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, SortableList, FormControl } from 'modules/common/components';
import { colors } from 'modules/common/styles';

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

const Child = styled.div`
  width: 100%;
  label {
    float: right;
  }
`;

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class ManageColumns extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeFields = this.onChangeFields.bind(this);

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

  onChangeFields(fields) {
    this.setState({ fields });
  }

  render() {
    const { config } = this.props;
    const { __ } = this.context;

    const configMap = {};

    config.forEach(config => {
      configMap[config.name] = true;
    });

    const child = field => {
      return (
        <Child>
          <span>{field.label}</span>
          <FormControl
            id={String(field._id)}
            defaultChecked={configMap[field.name]}
            componentClass="checkbox"
          />
        </Child>
      );
    };

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
          child={child}
          onChangeFields={this.onChangeFields}
          isModal={true}
        />

        <Footer>
          <Button
            type="button"
            btnStyle="simple"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={closeModal}
            btnStyle="success"
            icon="checked-1"
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
