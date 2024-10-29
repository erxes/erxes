import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import {
  Button,
  DataWithLoader,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { FilterContainer, FlexRow, Title } from "@erxes/ui-settings/src/styles";

import Form from "../containers/Form";
import { IDonateCampaign } from "../types";
import React, { useState } from "react";
import Row from "./Row";
import Sidebar from "../../general/components/Sidebar";
import { Wrapper } from "@erxes/ui/src/layout";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  donateCampaigns: IDonateCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IDonateCampaign[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { donateCampaignIds: string[] }, emptyBulk: () => void) => void;
  searchValue: string;
  filterStatus: string;
  totalCount?: number;
};

const DonateCampaigns = (props: Props) => {
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
    const { toggleAll, donateCampaigns } = props;
    toggleAll(donateCampaigns, "donateCampaigns");
  };

  const renderRow = () => {
    const { donateCampaigns, toggleBulk, bulk } = props;

    return donateCampaigns.map((donateCampaign) => (
      <Row
        key={donateCampaign._id}
        donateCampaign={donateCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(donateCampaign)}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeDonateCampaigns = (donateCampaigns) => {
    const donateCampaignIds: string[] = [];

    donateCampaigns.forEach((donateCampaign) => {
      donateCampaignIds.push(donateCampaign._id);
    });

    props.remove({ donateCampaignIds }, props.emptyBulk);
  };

  const actionBarRight = () => {
    const { bulk } = props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeDonateCampaigns(bulk);
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

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add donate campaign
      </Button>
    );

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
          <ModalTrigger
            size={"lg"}
            title={__("Add donate campaign")}
            trigger={trigger}
            autoOpenKey="showProductModal"
            content={modalContent}
          />
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
    { title: __("Donate Campaign") },
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
        <Wrapper.Header title={__("Donate Campaign")} breadcrumb={breadcrumb} />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Donate Campaign")}</Title>}
          right={actionBarRight()}
        />
      }
      mainHead={header}
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

export default DonateCampaigns;
