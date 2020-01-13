import { IPipeline } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import { BoxContainer } from 'modules/settings/growthHacks/styles';
import React from 'react';
import PipelineRow from './PipelineRow';

type Props = {
  pipelines: IPipeline[];
};
class PipelineList extends React.Component<Props, {}> {
  render() {
    const { pipelines } = this.props;

    if (pipelines.length === 0) {
      return <EmptyState text="No projects" image="/images/actions/16.svg" />;
    }

    return (
      <BoxContainer>
        {pipelines.map(pipeline => (
          <PipelineRow key={pipeline._id} pipeline={pipeline} />
        ))}
      </BoxContainer>
    );
  }
}

export default PipelineList;
