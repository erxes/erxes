import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { FormControl } from "@erxes/ui/src/components/form";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import { colors } from "@erxes/ui/src/styles";
import { Title } from "@erxes/ui/src/styles/main";
import { __, router } from "@erxes/ui/src/utils";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import * as React from "react";
import Select, { OnChangeValue } from "react-select";
import { EMAIL_TYPES } from "../containers/EmailDelivery";
import Row from "./Row";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { EmailDeliveryItem } from "@erxes/ui-engage/src/types";

type Props = {
  list: EmailDeliveryItem[];
  searchValue?: string;
  loading: boolean;
  count: number;
  emailType: string;
  handleSelectEmailType: (type: string) => void;
  handleSelectStatus: (status: string) => void;
  status: string;
};

const breadcrumb = [
  { title: "Settings", link: "/settings" },
  { title: __("Email deliveries") },
];

const emailTypeOptions = [
  { value: "transaction", label: __("Transaction") },
  { value: "engage", label: __("SES Engage") },
];

const tableHeaders = {
  transaction: ["Subject", "To", "Cc", "Bcc", "From", "Status", "Created at"],
  engage: ["Customer", "Email", "Title", "Status", "Created at"],
};

export const STATUS_OPTIONS = [
  { value: "send", label: "Sent", color: colors.colorPrimary },
  { value: "delivery", label: "Delivered", color: colors.colorCoreBlue },
  { value: "open", label: "Opened", color: colors.colorCoreGreen },
  { value: "click", label: "Clicked", color: colors.colorCoreTeal },
  {
    value: "complaint",
    label: "Complained/Spammed",
    color: colors.colorCoreOrange,
  },
  { value: "bounce", label: "Bounced", color: colors.colorCoreGray },
  {
    value: "renderingfailure",
    label: "Rendering failure",
    color: colors.colorCoreBlack,
  },
  { value: "reject", label: "Rejected", color: colors.colorCoreRed },
];

function EmailDelivery({
  emailType,
  loading,
  count,
  list = [],
  handleSelectEmailType,
  searchValue,
  handleSelectStatus,
  status,
}: Props) {
  const [search, setSearch] = React.useState(searchValue);
  const timerRef = React.useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    setSearch(value);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const handleEmailtype = (value: OnChangeValue<{ value: string }, false>) => {
    setSearch("");
    return handleSelectEmailType(value?.value || "");
  };

  const handleStatusChange = (
    value: OnChangeValue<{ value: string }, false>
  ) => {
    return handleSelectStatus(value?.value || "");
  };

  function renderContent() {
    return (
      <Table
        $whiteSpace="wrap"
        $hover={true}
        $bordered={true}
        $condensed={true}
      >
        <thead>
          <tr>
            {(tableHeaders[emailType] || []).map((item, idx) => (
              <th key={idx}>{__(item)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <Row key={item._id} item={item} emailType={emailType} />
          ))}
        </tbody>
      </Table>
    );
  }

  function renderActionBar() {
    const isTransaction = emailType === EMAIL_TYPES.TRANSACTION;

    const content = (
      <BarItems>
        <FlexRow $alignItems="flex-end">
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={handleSearch}
            value={search}
          />

          <React.Fragment>
            {isEnabled("engages") && (
              <Select
                placeholder={__("Choose Email type")}
                value={emailTypeOptions.find(
                  (option) => option.value === emailType
                )}
                options={emailTypeOptions}
                onChange={handleEmailtype}
                isClearable={false}
              />
            )}
            {isTransaction ? null : (
              <Select
                placeholder={__("Choose status")}
                value={STATUS_OPTIONS.find((option) => option.value === status)}
                isClearable={true}
                options={STATUS_OPTIONS}
                onChange={handleStatusChange}
              />
            )}
          </React.Fragment>
        </FlexRow>
      </BarItems>
    );

    return (
      <Wrapper.ActionBar
        left={<Title>{__(`Email Deliveries (${count})`)}</Title>}
        right={content}
      />
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Email Deliveries")}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={count} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={count}
          emptyText={__("There are no logs")}
          emptyImage="/images/actions/21.svg"
        />
      }
      hasBorder={true}
    />
  );
}

export default EmailDelivery;
