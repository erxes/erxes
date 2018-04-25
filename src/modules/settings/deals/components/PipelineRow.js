import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PipelineRowContainer } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  onEdit: PropTypes.func
};

class PipelineRow extends Component {
  render() {
    const { pipeline, onEdit } = this.props;

    return (
      <PipelineRowContainer>
        <span>{pipeline.name}</span>
        <button onClick={onEdit}>edit</button>
      </PipelineRowContainer>
    );
  }
}

PipelineRow.propTypes = propTypes;

export default PipelineRow;
