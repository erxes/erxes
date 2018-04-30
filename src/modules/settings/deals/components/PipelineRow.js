import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActionButtons, Tip, Button } from 'modules/common/components';
import { PipelineRowContainer } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  edit: PropTypes.func,
  remove: PropTypes.func
};

class PipelineRow extends Component {
  renderExtraLinks() {
    const { edit, remove, pipeline } = this.props;

    return (
      <ActionButtons>
        <Tip text="Edit">
          <Button btnStyle="link" onClick={edit} icon="edit" />
        </Tip>
        <Tip text="Delete">
          <Button
            btnStyle="link"
            onClick={() => remove(pipeline._id)}
            icon="cancel-1"
          />
        </Tip>
      </ActionButtons>
    );
  }

  render() {
    const { pipeline } = this.props;

    return (
      <PipelineRowContainer>
        <span>{pipeline.name}</span>
        {this.renderExtraLinks()}
      </PipelineRowContainer>
    );
  }
}

PipelineRow.propTypes = propTypes;

export default PipelineRow;
