import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ActionButtons,
  ModalTrigger,
  Tip,
  Button,
  Icon
} from 'modules/common/components';
import { PipelineForm } from '../containers';
import { PipelineRowContainer } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired
};

class PipelineRow extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    const { pipeline } = this.props;

    this.props.remove(pipeline._id);
  }

  renderExtraLinks() {
    const { pipeline, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ActionButtons>
        <ModalTrigger title="Edit pipeline" trigger={editTrigger}>
          <PipelineForm pipeline={pipeline} save={save} />
        </ModalTrigger>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
        </Tip>
      </ActionButtons>
    );
  }

  render() {
    const { pipeline } = this.props;

    return (
      <PipelineRowContainer>
        <span>{pipeline.name}</span>
        <ActionButtons>{this.renderExtraLinks()}</ActionButtons>
      </PipelineRowContainer>
    );
  }
}

PipelineRow.propTypes = propTypes;

export default PipelineRow;
