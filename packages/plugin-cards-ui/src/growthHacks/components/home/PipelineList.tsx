import React, { useState } from 'react';
import { BoxContainer, ProjectItem } from './styles';

import { IPipeline } from '@erxes/ui-cards/src/boards/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import PipelineForm from '../../../settings/boards/containers/PipelineForm';
import { options } from '../../../settings/growthHacks/options';
import PipelineRow from './PipelineRow';

type Props = {
  pipelines: IPipeline[];
  renderAddButton: (props: IButtonMutateProps) => JSX.Element;
};

function PipelineList(props: Props) {
  const [showPopup, setVisibility] = useState(false);

  const toggleVisibility = () => {
    setVisibility(!showPopup);
  };

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

  return (
    <BoxContainer>
      <div>
        <ProjectItem new={true} onClick={toggleVisibility}>
          <h5>
            {__('+ Create New Project')}
            <br />
          </h5>
        </ProjectItem>
      </div>
      {renderAddForm()}
      {pipelines.map(pipeline => (
        <PipelineRow key={pipeline._id} pipeline={pipeline} />
      ))}
    </BoxContainer>
  );
}

export default PipelineList;
