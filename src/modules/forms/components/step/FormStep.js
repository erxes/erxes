import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormControl, Button } from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import { FlexItem, LeftItem, Preview, Title } from './style';

const Fields = styled.ul`
  list-style: none;
  padding: 0;

  button {
    color: ${colors.colorSecondary};
    font-weight: 500;
  }
`;

const FieldItem = styled.li`
  padding: 6px 40px 6px 20px;
  position: relative;
  margin-bottom: ${dimensions.unitSpacing - 4}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const propTypes = {
  hasOptions: PropTypes.bool
};

class FormStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      add: false
    };

    this.handleOption = this.handleOption.bind(this);
    this.renderNewField = this.renderNewField.bind(this);
  }

  handleOption() {
    this.setState({ add: !this.state.add });
  }

  renderNewField() {
    if (this.state.add) {
      return (
        <div>
          <FormControl
            componentClass="select"
            placeholder="Select Brand"
            defaultValue="hehe"
            onChange={this.handleBrandChange}
            id="selectBrand"
          >
            <option>haha 1</option>
            <option>haha 2</option>
          </FormControl>
          <Button
            type="success"
            btnStyle="simple"
            size="small"
            onClick={this.handleOption}
          >
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={this.handleOption}
        btnStyle="link"
        size="small"
        icon="plus"
      >
        Add another form field
      </Button>
    );
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <Title>Included fields</Title>
          <Fields>
            <FieldItem>Email</FieldItem>
            {this.renderNewField()}
          </Fields>
        </LeftItem>
        <Preview>right</Preview>
      </FlexItem>
    );
  }
}

FormStep.propTypes = propTypes;

export default FormStep;
