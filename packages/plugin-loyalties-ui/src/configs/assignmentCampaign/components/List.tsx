import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import {
  Button,
  DataWithLoader,
  FormControl,
  HeaderDescription,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import {
  FilterContainer,
  FlexRow,
  Title,
} from "@erxes/ui-settings/src/styles";

import CreateForm from "./CreateForm";
import { IAssignmentCampaign } from "../types";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import Row from "./Row";
import Sidebar from "../../general/components/Sidebar";
import { Wrapper } from "@erxes/ui/src/layout";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  assignmentCampaigns: IAssignmentCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IAssignmentCampaign[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (
    doc: { assignmentCampaignIds: string[] },
    emptyBulk: () => void
  ) => void;
  searchValue: string;
  filterStatus: string;
  totalCount?: number;
};

const AssignmentCampaigns = (props: Props) => {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue || "");
  const [filterStatus, setFilterStatus] = useState(props.filterStatus || "");
  const location = useLocation();
  const navigate = useNavigate();

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const onChange = () => {
    const { toggleAll, assignmentCampaigns } = props;
    toggleAll(assignmentCampaigns, "assignmentCampaigns");
  };

  const renderRow = () => {
    const { assignmentCampaigns, toggleBulk, bulk } = props;

    return assignmentCampaigns.map((assignmentCampaign) => (
      <Row
        key={assignmentCampaign._id}
        assignmentCampaign={assignmentCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(assignmentCampaign)}
      />
    ));
  };

  const formContent = (props) => {
    const { queryParams } = props;
    return <CreateForm {...props} queryParams={queryParams} />;
  };

  const removeAssignmentCampaigns = (assignmentCampaigns) => {
    const assignmentCampaignIds: string[] = [];

    assignmentCampaigns.forEach((assignmentCampaign) => {
      assignmentCampaignIds.push(assignmentCampaign._id);
    });

    props.remove({ assignmentCampaignIds }, props.emptyBulk);
  };

  const actionBarRight = () => {
    const { bulk } = props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeAssignmentCampaigns(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      );
    }

    return (
      <FilterContainer>
        <FlexRow>
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={search}
            value={searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
          <Link to={`/erxes-plugin-loyalty/settings/assignment/create`}>
            <Button btnStyle="success" size="medium" icon="plus-circle">
              Add assignment campaign
            </Button>
          </Link>
        </FlexRow>
      </FilterContainer>
    );
  };

  const { loading, isAllSelected, totalCount } = props;

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    {
      title: __("Loyalties config"),
      link: "/erxes-plugin-loyalty/settings/general",
    },
    { title: __("Assignment Campaign") },
  ];

  const header = (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={__("Loyalty configs")}
      description=""
    />
  );

  const content = (
    <Table $hover={true}>
      <thead>
        <tr>
          <th style={{ width: 60 }}>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          <th>{__("Title")}</th>
          <th>{__("Start Date")}</th>
          <th>{__("End Date")}</th>
          <th>{__("Finish Date of Use")}</th>
          <th>{__("Status")}</th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Assignment Campaign")}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={header}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Assignment Campaign")}</Title>}
          right={actionBarRight()}
        />
      }
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={<Sidebar />}
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={totalCount && totalCount} />}
    />
  );
};

export default AssignmentCampaigns;
