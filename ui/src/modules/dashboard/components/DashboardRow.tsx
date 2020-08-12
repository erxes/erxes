import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectItem } from '../styles';
import { IDashboard } from '../types';

type Props = {
  dashboard: IDashboard;
};

class PipelineRow extends React.Component<Props, {}> {
  render() {
    const { dashboard } = this.props;

    return (
      <Link to={`/dashboard/${dashboard._id}`}>
        <ProjectItem key={dashboard._id}>
          <h5>{dashboard.name}</h5>
        </ProjectItem>
      </Link>
    );
  }
}

export default PipelineRow;
