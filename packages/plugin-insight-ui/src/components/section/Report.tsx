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

type Props = {
  queryParams: any;

  reports: IReport[];
  sections: ISection[];
  loading: boolean;

  removeReports: (reportIds: string[]) => void;
};

const ReportSection = (props: Props) => {
  const { queryParams, reports, sections, loading, removeReports } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentReport, setCurrentReport] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const extraButtons = (
    <Tip text="Add report" placement="top">
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
      <Button btnStyle="link" onClick={() => removeReports([report._id])}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="times-circle" />
        </Tip>
      </Button>
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
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
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
