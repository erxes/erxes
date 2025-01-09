import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { FormControl } from "@erxes/ui/src/components";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IReport } from "../types";
import Row from "./Row";
import SideBar from "../containers/SideBar";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Table from "@erxes/ui/src/components/table";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";
import withTableWrapper from "@erxes/ui/src/components/table/withTableWrapper";

type Props = {
  reports: IReport[];
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  removeReports: (reportIds: string[], callback?: any) => void;
  editReport?: (report: IReport) => void;
  loading: boolean;

  queryParams: any;
};

function List(props: Props) {
  const { reports, loading, queryParams, removeReports } = props;
  const [searchValue, setSearchvalue] = useState(queryParams.searchValue || "");
  const [chosenReportIds, setChosenReportIds] = useState<any>([]);

  const [timer, setTimer] = useState<NodeJS.Timer>(undefined);
  const location = useLocation();
  const navigate = useNavigate();

  // let timer: NodeJS.Timer;

  const search = e => {
    if (timer) {
      clearTimeout(timer);
      setTimer(undefined);
    }

    const value = e.target.value;
    setSearchvalue(value);

    setTimer(
      setTimeout(() => {
        router.removeParams(navigate, location, "page");
        router.setParams(navigate, location, { searchValue: value });
      }, 500)
    );
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const title = <Title $capitalize={true}>{__("Reports")}</Title>;

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      <Button
        btnStyle="success"
        size="small"
        icon="plus-circle"
        onClick={() => navigate("/reports/details/create-report")}
      >
        {__("Create a report")}
      </Button>
    </BarItems>
  );

  const toggleReport = (reportId: string, isChecked?: boolean) => {
    if (isChecked) {
      setChosenReportIds([...chosenReportIds, reportId]);
    } else {
      setChosenReportIds(chosenReportIds.filter(id => id !== reportId));
    }
  };

  const updatedProps = {
    ...props,
    toggleReport
  };
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__("")}</th>
          <th>{__("Name")}</th>
          <th>{__("Charts")}</th>
          <th>{__("Last updated by")}</th>
          <th>{__("Created by")}</th>
          <th>{__("Last updated at")}</th>
          <th>{__("Created at")}</th>
          <th>{__("Tags")}</th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => {
          return (
            <Row
              navigate={navigate}
              key={report._id}
              report={report}
              {...updatedProps}
              isChecked={chosenReportIds.includes(report._id) || false}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const afterTag = () => {
    setChosenReportIds([]);
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Reports"), link: "/reports" }
  ];

  let actionBarLeft: React.ReactNode;

  if (chosenReportIds.length) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    actionBarLeft = (
      <BarItems>
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={() =>
            removeReports(chosenReportIds, () => setChosenReportIds([]))
          }
        >
          Remove
        </Button>

        <TaggerPopover
          type={TAG_TYPES.REPORT}
          successCallback={afterTag}
          targets={reports.filter(r => chosenReportIds.includes(r._id))}
          trigger={tagButton}
          refetchQueries={["reportsCountByTags"]}
        />
      </BarItems>
    );
  }

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      left={actionBarLeft}
      wideSpacing
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Reports")}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={reports.length}
          emptyText={__("There are no reports")}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      leftSidebar={<SideBar />}
      hasBorder
    />
  );
}

export default withTableWrapper("Reports", List);
