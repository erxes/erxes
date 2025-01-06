import { FilterContainer, FlexRow, Title } from "@erxes/ui-settings/src/styles";
import {
  __,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  Table
} from "@erxes/ui/src";
import { Wrapper } from "@erxes/ui/src/layout";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../general/components/Sidebar";
import { IScoreCampaign } from "../types";
import Form from "./Form";
import Row from "./Row";

const breadcrumb = [
  { title: __("Settings"), link: "/settings" },
  {
    title: __("Loyalties Config"),
    link: "/erxes-plugin-loyalty/settings/general"
  },
  { title: __("Score Campaign") }
];

type Props = {
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: (target: any, toAdd: boolean) => void;
  toggleAll: (targets: any[], containerId: string) => void;
  campaigns: IScoreCampaign[];
  queryParams: any;
  totalCount: number;
  refetch: () => void;
  onRemove: () => void;
  onChangeStatus: (_id: string, status: "published" | "draft") => void;
};

export default function List({
  bulk,
  queryParams,
  isAllSelected,
  toggleAll,
  toggleBulk,
  campaigns,
  totalCount,
  onRemove,
  refetch,
  onChangeStatus
}: Props) {
  let timer;

  const [searchValue, setSearchValue] = useState(
    queryParams?.searchValue || ""
  );

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

  const actionBarRight = () => {
    if (bulk.length) {
      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onRemove}
        >
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add score campaign
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
            title={__("Add score campaign")}
            trigger={trigger}
            autoOpenKey="showProductModal"
            content={({ closeModal }) => <Form closeModal={closeModal} />}
          />
        </FlexRow>
      </FilterContainer>
    );
  };

  const onChange = () => {
    toggleAll(
      campaigns.map(({ _id }) => _id),
      "campaigns"
    );
  };

  const content = (
    <Table $hover>
      <thead>
        <tr>
          <th>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          <th>{__("Title")}</th>
          <th>{__("Owner Type")}</th>
          <th>{__("Status")}</th>
          <th>{__("Action")}</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign) => (
          <Row
            toggleBulk={toggleBulk}
            isChecked={bulk.find((item) => item._id === campaign._id)}
            campaign={campaign}
            refetch={refetch}
            onChangeStatus={onChangeStatus}
          />
        ))}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Score Campaign")} breadcrumb={breadcrumb} />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title $capitalize={true}>{__("Score Campaign")}</Title>}
          right={actionBarRight()}
        />
      }
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={totalCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={<Sidebar />}
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={totalCount} />}
    />
  );
}
