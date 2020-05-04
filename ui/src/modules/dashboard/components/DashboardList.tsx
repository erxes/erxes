import { IButtonMutateProps } from 'modules/common/types';
// import PipelineForm from 'modules/settings/boards/containers/PipelineForm';
import React, { useState } from 'react';
import { BoxContainer, ProjectItem } from '../styles';
import { IDashboard } from '../types';
import DashboardRow from './DashboardRow';

type Props = {
  dashboards: IDashboard[];
  renderAddButton: (props: IButtonMutateProps) => JSX.Element;
};

function DashboardList(props: Props) {
  const [showPopup, setVisibility] = useState(false);

  const toggleVisibility = () => {
    setVisibility(!showPopup);
  };

  const renderAddForm = () => {
    // const { renderAddButton } = props;

    return <div />;
  };

  const { dashboards } = props;

  return (
    <BoxContainer>
      <div>
        <ProjectItem new={true} onClick={toggleVisibility}>
          <h5>
            +<br />
            Create <br />
            New <br />
            Dashboard
          </h5>
        </ProjectItem>
      </div>
      {renderAddForm()}
      {dashboards.map(dashboard => (
        <DashboardRow key={dashboard._id} dashboard={dashboard} />
      ))}
    </BoxContainer>
  );
}

export default DashboardList;
