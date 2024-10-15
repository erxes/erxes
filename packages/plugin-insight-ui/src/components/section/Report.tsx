import { IReport, ISection } from "../../types";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormContainer from "../../containers/report/Form";
import Icon from "@erxes/ui/src/components/Icon";
import { RightDrawerContainer } from "../../styles";
import SectionList from "../../containers/section/List";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Spinner from "@erxes/ui/src/components/Spinner";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/index";
import { colors } from "@erxes/ui/src/styles";

type Props = {
  queryParams: any;

  reports: IReport[];
  sections: ISection[];
  loading: boolean;

  updateReport: (id: string) => void;
  removeReports: (id: string) => void;
};

const ReportSection = (props: Props) => {
  const { queryParams, reports, sections, loading, updateReport, removeReports } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentReport, setCurrentReport] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const extraButtons = (
    <Tip text="Add report" placement="left">
      <a
        href="#addReport"
        onClick={() => {
          setCurrentReport({} as any);
          setShowDrawer(!showDrawer);
        }}
      >
        <Icon icon="plus-circle" />
      </a>
    </Tip>
  );

  const renderEditAction = (report: any) => {
    return (
      <Button
        btnStyle="link"
        onClick={() => {
          setCurrentReport(report);
          setShowDrawer(!showDrawer);
        }}
      >
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (report: any) => {
    return (
      <Button btnStyle="link" onClick={() => removeReports(report._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="times-circle" />
        </Tip>
      </Button>
    );
  };

  const renderAdditionalActions = (report: any) => {

    const pinIcon = (
      <i style={{ display: "flex" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={report.isPinned ? colors.colorPrimary : 'none'}
          stroke={report.isPinned ? colors.colorPrimary : colors.colorCoreGray}
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
      <Button btnStyle="link" onClick={() => updateReport(report._id)} >
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

  const handleClick = (reportId) => {
    navigate(`/insight?reportId=${reportId}`, {replace: true})
  };

  const renderListWithoutSection = () => {
    const items = reports.filter(
      (report) =>
        report.sectionId === null || !report.hasOwnProperty("sectionId")
    );

    if (items.length === 0) {
      return null;
    }

    return (
      <CollapsibleList
        items={items}
        queryParamName="reportId"
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
      return <Spinner objective={true} height='50px'/>;
    }

    if (sections?.length === 0 && reports?.length === 0) {
      return <EmptyState icon="align-justify" text="No data for report" />;
    }

    return (
      <SidebarList>
        {(sections || []).map((section) => (
          <SectionList
            key={section._id}
            section={section}
            list={reports}
            queryParamName="reportId"
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
        title="Report"
        name="report"
        isOpen={
          Object.keys(queryParams).length === 0 ? true : !!queryParams.reportId
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
            {
              <FormContainer
                queryParams={queryParams}
                reportId={currentReport._id}
                closeDrawer={closeDrawer}
              />
            }
          </RightDrawerContainer>
        </CSSTransition>
      </div>
    </>
  );
};

export default ReportSection;
