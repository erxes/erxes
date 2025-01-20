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
import {
  Title,
} from "@erxes/ui-settings/src/styles";

import Form from "../containers/Form";
import { IVoucherCampaign } from "../types";
import React, { useState } from "react";
import Row from "./Row";
import Sidebar from "../../general/components/Sidebar";
import { Wrapper, BarItems } from "@erxes/ui/src/layout";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  voucherCampaigns: IVoucherCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IVoucherCampaign[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (
    doc: { voucherCampaignIds: string[] },
    emptyBulk: () => void
  ) => void;
  searchValue: string;
  filterStatus: string;
  totalCount?: number;
};

const VoucherCampaigns = (props: Props) => {
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
    const { toggleAll, voucherCampaigns } = props;
    toggleAll(voucherCampaigns, "voucherCampaigns");
  };

  const renderRow = () => {
    const { voucherCampaigns, toggleBulk, bulk } = props;

    return voucherCampaigns.map((voucherCampaign) => (
      <Row
        key={voucherCampaign._id}
        voucherCampaign={voucherCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(voucherCampaign)}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeVoucherCampaigns = (voucherCampaigns) => {
    const voucherCampaignIds: string[] = [];

    voucherCampaigns.forEach((voucherCampaign) => {
      voucherCampaignIds.push(voucherCampaign._id);
    });

    props.remove({ voucherCampaignIds }, props.emptyBulk);
  };

  const actionBarRight = () => {
    const { bulk } = props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeVoucherCampaigns(bulk);
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
        Add voucher campaign
      </Button>
    );

    return (
      <BarItems>
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
          title={__("Add voucher campaign")}
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </BarItems>
    );
  };

  const { loading, isAllSelected, totalCount, voucherCampaigns } = props;

  const header = (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title="Loyalty configs"
      description=""
    />
  );

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    {
      title: __("Loyalties Config"),
      link: "/erxes-plugin-loyalty/settings/general",
    },
    { title: __("Voucher Campaign") },
  ];

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
          <th>{__("Type")}</th>
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
          title={__("Voucher Campaign")}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={header}
      actionBar={
        <Wrapper.ActionBar
          left={<Title $capitalize={true}>{__("Voucher Campaign")}</Title>}
          right={actionBarRight()}
        />
      }
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={voucherCampaigns.length}
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

export default VoucherCampaigns;
