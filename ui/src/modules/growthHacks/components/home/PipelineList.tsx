import { IPipeline } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import { ProjectItem } from 'modules/growthHacks/styles';
import PipelineForm from 'modules/settings/boards/containers/PipelineForm';
import { options } from 'modules/settings/growthHacks/options';
import { BoxContainer } from 'modules/settings/growthHacks/styles';
import React, { useState } from 'react';
import PipelineRow from './PipelineRow';

type Props = {
  pipelines: IPipeline[];
  renderAddButton: any;
};
function PipelineList(props: Props) {
  const [ showPopup, setVisibility ] = useState(false);
  
  const toggleVisibility = () => {
    setVisibility(!showPopup)
  }

  const renderAddForm = () => {
    const { renderAddButton } = props;

    return (
      <PipelineForm
        options={options}
        type="growthHack"
        renderButton={renderAddButton}
        show={showPopup}
        closeModal={toggleVisibility}
      />
    );
  };

  const { pipelines } = props;

  if (pipelines.length === 0) {
    return <EmptyState text="No projects" image="/images/actions/16.svg" />;
  }

  return (
    <BoxContainer>
      <ProjectItem new={true} onClick={toggleVisibility}>
        <h5>+<br />Create <br />New <br />Project</h5>
      </ProjectItem>
      {renderAddForm()}
      {pipelines.map(pipeline => (
        <PipelineRow key={pipeline._id} pipeline={pipeline} />
      ))}
    </BoxContainer>
  );
}

export default PipelineList;
