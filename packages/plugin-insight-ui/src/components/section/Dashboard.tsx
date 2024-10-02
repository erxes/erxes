import { IDashboard, ISection } from "../../types";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormContainer from "../../containers/dashboard/Form";
import Icon from "@erxes/ui/src/components/Icon";
import { RightDrawerContainer } from "../../styles";
import SectionList from "../../containers/section/List";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Spinner from "@erxes/ui/src/components/Spinner";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/index";
import colors from "@erxes/ui/src/styles/colors"

type Props = {
  queryParams: any;

  sections: ISection[];
  dashboards: IDashboard[];
  loading: boolean;

  updateDashboard: (id: string) => void;
  removeDashboard: (id: string) => void;
};

const DashboardSection = (props: Props) => {
  const { queryParams, sections, dashboards, loading, updateDashboard, removeDashboard } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentDashboard, setCurrentDashboard] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentDashboard({});
  };

  const extraButtons = (
    <Tip text="Add dashboard" placement="left">
      <a
        href="#addDashboard"
        onClick={() => {
          setCurrentDashboard({} as any);
          setShowDrawer(!showDrawer);
        }}
      >
        <Icon icon="plus-circle" />
      </a>
    </Tip>
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
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (dashboard: any) => {
    return (
      <Button btnStyle="link" onClick={() => removeDashboard(dashboard._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="times-circle" />
        </Tip>
      </Button>
    );
  };

  const renderAdditionalActions = (dashboard: any) => {

    const pinIcon = (
      <i style={{ display: "flex" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={dashboard.isPinned ? colors.colorPrimary : 'none'}
          stroke={dashboard.isPinned ? colors.colorPrimary : colors.colorCoreGray}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 17v5" />
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
        </svg>
      </i>
    )

    const pinAction = (
      <Button btnStyle="link" onClick={() => updateDashboard(dashboard._id)} >
        <Tip text={__("Pin")} placement="bottom">
          {pinIcon}
        </Tip>
      </Button>
    )

    return (
      <>
        {pinAction}
      </>
    );
  };

  const handleClick = (_id) => {
    navigate(`/insight?dashboardId=${_id}`, { replace: true });
  };

  const renderListWithoutSection = () => {
    const items = dashboards.filter(
      (dashboard) =>
        dashboard.sectionId === null || !dashboard.hasOwnProperty("sectionId")
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
        additionalActions={renderAdditionalActions}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} height='50px' />;
    }

    if (sections?.length === 0 && dashboards?.length === 0) {
      return <EmptyState icon="align-justify" text="No data for dashboard" />;
    }

    return (
      <SidebarList>
        {(sections || []).map((section) => (
          <SectionList
            key={section._id}
            section={section}
            list={dashboards}
            queryParamName="dashboardId"
            queryParams={queryParams}
            handleClick={handleClick}
            renderEditAction={renderEditAction}
            renderRemoveAction={renderRemoveAction}
            renderAdditionalActions={renderAdditionalActions}
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
        <CSSTransition
          in={showDrawer}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightDrawerContainer>
            <FormContainer
              queryParams={queryParams}
              dashboardId={currentDashboard._id}
              closeDrawer={closeDrawer}
            />
          </RightDrawerContainer>
        </CSSTransition>
      </div>
    </>
  );
};

export default DashboardSection;
