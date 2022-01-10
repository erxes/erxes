import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import DashbaordForm from '../containers/DashboardForm';
import { IDashboard } from '../types';

type Props = {
  dashboard: IDashboard;
  isActive: boolean;
  removeDashboard: (id: string) => void;
};

class PipelineRow extends React.Component<Props, {}> {
  render() {
    const { dashboard, isActive, removeDashboard } = this.props;

    const remove = () => {
      removeDashboard(dashboard._id);
    };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="left">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <SidebarListItem key={dashboard._id} isActive={isActive}>
        <Link to={`/dashboard/${dashboard._id}`}>{dashboard.name}</Link>
        <ActionButtons>
          <DashbaordForm dashboard={dashboard} trigger={editTrigger} />
          <Tip text={__('Delete')} placement="left">
            <Button btnStyle="link" icon="times-circle" onClick={remove} />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default PipelineRow;
