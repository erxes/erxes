import * as React from "react";

import {
  FilterItem,
  FilterWrapper,
} from "@erxes/ui-settings/src/permissions/styles";
import { __, router } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { ISmsDelivery } from "../types";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Row from "./Row";
import Select from "react-select";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
} & commonProps;

type commonProps = {
  smsDeliveries: ISmsDelivery[];
  count?: number;
};

const breadcrumb = [
  { title: "Settings", link: "/settings" },
  { title: __("SMS deliveries") },
];

export const SOURCE_TYPES = {
  CAMPAIGN: "campaign",
  INTEGRATION: "integration",
  ALL: ["campaign", "integration"],
  OPTIONS: [
    { value: "campaign", label: "Campaign" },
    { value: "integration", label: "Conversation" },
  ],
};

const SmsDeliveries = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const qp = props.queryParams || { type: "" };

  const [type, setType] = React.useState(qp.type || SOURCE_TYPES.CAMPAIGN);

  const onClick = () => {
    router.setParams(navigate, location, { type });
  };

  const renderRows = () => {
    const { smsDeliveries } = props;
    const rows: JSX.Element[] = [];

    if (!smsDeliveries) {
      return rows;
    }

    for (const log of smsDeliveries) {
      rows.push(<Row key={log._id} log={log} type={type} />);
    }

    return rows;
  };

  const renderContent = () => {
    return (
      <Table
        $whiteSpace="wrap"
        $hover={true}
        $bordered={true}
        $condensed={true}
      >
        <thead>
          <tr>
            <th key="date">{__("Date")}</th>
            <th key="direction">{__("Direction")}</th>
            <th key="to">{__("To")}</th>
            <th key="status">{__("Status")}</th>
            <th key="campaign">{__("Campaign")}</th>
            <th key="from">{__("From")}</th>
            <th key="content">{__("Content")}</th>
            <th key="errors">{__("Error")}</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    );
  };

  const renderActionBar = () => {
    const onTypeChange = (option) => {
      setType(option && option.value ? option.value : "");
    };

    const actionBarLeft = (
      <FilterWrapper style={{ padding: "10px 0px" }}>
        <strong>{__("Filters")}:</strong>
        <FilterItem>
          <Select
            placeholder={__("Choose module")}
            value={SOURCE_TYPES.OPTIONS.find((item) => item.value === type)}
            options={SOURCE_TYPES.OPTIONS}
            onChange={onTypeChange}
            isClearable={false}
          />
        </FilterItem>
        <Button
          btnStyle="primary"
          icon="filter-1"
          onClick={onClick}
          size="small"
        >
          {__("Filter")}
        </Button>
      </FilterWrapper>
    );

    return <Wrapper.ActionBar left={actionBarLeft} />;
  };

  const { isLoading, count } = props;

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("SMS deliveries")} breadcrumb={breadcrumb} />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={count} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={isLoading}
          count={count}
          emptyText={__("There are no SMS deliveries recorded")}
          emptyImage="/images/actions/21.svg"
        />
      }
    />
  );
};

export default SmsDeliveries;
