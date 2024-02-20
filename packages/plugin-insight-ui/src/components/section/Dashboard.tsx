import React, { useRef, useState } from 'react';
import RTG from 'react-transition-group';
import Dropdown from 'react-bootstrap/Dropdown';

import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import Box from '@erxes/ui/src/components/Box';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';
import { SidebarList } from '@erxes/ui/src/layout/styles';

import FormContainer from '../../containers/dashboard/Form';
import SectionList from '../../containers/section/List';
import { RightDrawerContainer } from '../../styles';
import { IDashboard, ISection } from '../../types';

type Props = {
  history: any;
  queryParams: any;

  sections: ISection[];
  dashboards: IDashboard[];

  removeDashboard: (id: string) => void;
};

const DashboardSection = (props: Props) => {
  const { queryParams, history, sections, dashboards, removeDashboard } = props;

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentDashboard, setCurrentDashboard] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentDashboard({});
  };

  const extraButtons = (
    <Dropdown drop="down" alignRight={true}>
      <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
        <Icon icon="ellipsis-h" size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <li>
          {
            <a
              href="#addDashboard"
              onClick={() => {
                setCurrentDashboard({} as any);
                setShowDrawer(!showDrawer);
              }}
            >
              <Icon icon="plus-1" />

              {__('Dashboard')}
            </a>
          }
        </li>
      </Dropdown.Menu>
    </Dropdown>
  );

  const renderEditAction = (dashboard: any) => {
    return (
      <Button
        btnStyle="link"
        onClick={() => {
          setCurrentDashboard(dashboard);
          setShowDrawer(!showDrawer);
        }}
      >
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (dashboard: any) => {
    return (
      <Button btnStyle="link" onClick={() => removeDashboard(dashboard._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="times-circle" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (_id) => {
    router.removeParams(history, ...Object.keys(queryParams));
    router.setParams(history, { dashboardId: _id });
  };

  const renderListWithoutSection = () => {
    const items = dashboards.filter(
      (dashboard) =>
        dashboard.sectionId === null || !dashboard.hasOwnProperty('sectionId'),
    );

    if (items.length === 0) {
      return null;
    }

    return (
      <CollapsibleList
        items={items}
        queryParamName="dashboardId"
        queryParams={queryParams}
        keyCount="chartsCount"
        icon="chart-pie"
        treeView={false}
        onClick={handleClick}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
      />
    );
  };

  const renderContent = () => {
    return (
      <SidebarList>
        {sections.map((section) => (
          <SectionList
            key={section._id}
            section={section}
            list={dashboards}
            queryParamName="dashboardId"
            queryParams={queryParams}
            handleClick={handleClick}
            renderEditAction={renderEditAction}
            renderRemoveAction={renderRemoveAction}
          />
        ))}
        {<div>{renderListWithoutSection()}</div>}
      </SidebarList>
    );
  };

  return (
    <>
      <Box
        title="Dashboard"
        name="dashboard"
        isOpen={
          Object.keys(queryParams).length === 0
            ? true
            : !!queryParams.dashboardId
        }
        collapsible={false}
        extraButtons={extraButtons}
      >
        {renderContent()}
      </Box>

      <div ref={wrapperRef}>
        <RTG.CSSTransition
          in={showDrawer}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightDrawerContainer>
            {
              <FormContainer
                queryParams={queryParams}
                history={history}
                dashboardId={currentDashboard._id}
                closeDrawer={closeDrawer}
              />
            }
          </RightDrawerContainer>
        </RTG.CSSTransition>
      </div>
    </>
  );
};

export default DashboardSection;
