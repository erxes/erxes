import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';
import { FlexItem, LeftItem, Preview, Title } from './style';

const propTypes = {
  hasOptions: PropTypes.bool
};

class SuccessStep extends Component {
  render() {
    const { __ } = this.context;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('On success')}</Title>
          <FormControl componentClass="select" value="type">
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
          </FormControl>

          <Title>{__('Thank content')}</Title>
          <FormControl
            id="description"
            componentClass="textarea"
            defaultValue="Thank you."
          />
        </LeftItem>
        <Preview>right</Preview>
      </FlexItem>
    );
  }
}

SuccessStep.propTypes = propTypes;
SuccessStep.contextTypes = {
  __: PropTypes.func
};

export default SuccessStep;
