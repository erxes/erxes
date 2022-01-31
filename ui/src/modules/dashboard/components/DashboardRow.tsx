import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import DashbaordForm from '../containers/DashboardForm';
import { IDashboard } from '../types';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const DashboardWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type Props = {
  dashboard: IDashboard;
  dashboards: IDashboard[];
  isActive: boolean;
  removeDashboard: (id: string) => void;
  loading: boolean;
  space: number;
};

class DashboardRow extends React.Component<Props, {}> {
  render() {
    const {
      dashboard,
      isActive,
      removeDashboard,
      loading,
      dashboards,
      space
    } = this.props;

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
        <DashboardWrapper space={space}>
          <Link to={`/dashboard/${dashboard._id}`}>{dashboard.name}</Link>
        </DashboardWrapper>
        <ActionButtons>
          <DashbaordForm
            dashboard={dashboard}
            trigger={editTrigger}
            loading={loading}
            dashboards={dashboards}
          />
          <Tip text={__('Delete')} placement="left">
            <Button btnStyle="link" icon="times-circle" onClick={remove} />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default DashboardRow;
