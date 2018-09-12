import { ActionButtons, Button, Tip } from 'modules/common/components';
import React, { Component } from 'react';
import { PipelineRowContainer } from '../styles';
import { IPipeline } from '../types';

type Props = {
  pipeline: IPipeline,
  edit: () => void,
  remove: (_id: string) => void,
};

class PipelineRow extends Component<Props> {
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

export default PipelineRow;
