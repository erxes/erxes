import { ActionButtons, Button, Tip } from 'modules/common/components';
import * as React from 'react';
import { PipelineRowContainer } from '../styles';
import { IPipeline } from '../types';

type Props = {
  pipeline: IPipeline;
  edit: () => void;
  remove: (pipelineId: string) => void;
};

class PipelineRow extends React.Component<Props> {
  renderExtraLinks() {
    const { edit, remove, pipeline } = this.props;

    const onClick = () => remove(pipeline._id);

    return (
      <ActionButtons>
        <Tip text="Edit">
          <Button btnStyle="link" onClick={edit} icon="edit" />
        </Tip>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
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
