import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';
import { PipelineRowContainer } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  toggleBulk: PropTypes.func
};

class PipelineRow extends Component {
  render() {
    const { pipeline, toggleBulk } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(pipeline, e.target.checked);
      }
    };

    return (
      <PipelineRowContainer>
        <FormControl componentClass="checkbox" onChange={onChange} />
        <span>{pipeline.name}</span>
      </PipelineRowContainer>
    );
  }
}

PipelineRow.propTypes = propTypes;

export default PipelineRow;
