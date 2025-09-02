import {
  Button,
  DataWithLoader,
  FormControl,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { IQueryParams } from "@erxes/ui/src/types";
import { __, router } from "@erxes/ui/src/utils";

import { Title } from "@erxes/ui-settings/src/styles";
import { BarItems } from "@erxes/ui/src";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { SimpleButton } from "@erxes/ui/src/styles/main";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IVoucherCampaign } from "../../../configs/voucherCampaign/types";
import { menuLoyalties } from "../../common/constants";
import VoucherForm from "../containers/Form";
import { IVoucher } from "../types";
import Row from "./Row";
import Sidebar from "./Sidebar";
interface IProps {
  vouchers: IVoucher[];
  currentCampaign?: IVoucherCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  removeVouchers: ({ voucherIds }: { voucherIds: string[] }) => void;
  queryParams: IQueryParams;
}

const VouchersList = (props: IProps) => {
  const { queryParams, loading, vouchers, totalCount } = props;

  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(queryParams.searchValue);
  const [toggleSidebar, setToggleSidebar] = useState<boolean>(true);

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    setSearchValue(value);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Created At</th>
            <th>Owner Type</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(vouchers || []).map((voucher) => (
            <Row voucher={voucher} queryParams={queryParams} />
          ))}
        </tbody>
      </Table>
    );
  };

  const voucherForm = (props) => {
    return <VoucherForm {...props} queryParams={queryParams} />;
  };

  const renderActions = () => {
    const formTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add voucher
      </Button>
    );

    const left = (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <SimpleButton
          id="btn-inbox-channel-visible"
          $isActive={toggleSidebar}
          onClick={() => setToggleSidebar(!toggleSidebar)}
        >
          <Icon icon="subject" />
        </SimpleButton>
        <Title>{`All voucher List (${totalCount})`}</Title>
      </div>
    );

    const right = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={search}
          value={searchValue}
          autoFocus={true}
        />
        <ModalTrigger
          title={__("New Voucher")}
          trigger={formTrigger}
          autoOpenKey="showVoucherModal"
          content={voucherForm}
          backDrop="static"
        />
      </BarItems>
    );

    return <Wrapper.ActionBar left={left} right={right} />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Vouchers`) + ` (${totalCount})`}
          submenu={menuLoyalties}
        />
      }
      actionBar={renderActions()}
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        toggleSidebar && (
          <Sidebar loadingMainQuery={loading} queryParams={queryParams} />
        )
      }
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={vouchers.length}
          emptyText="Add in your first voucher!"
          emptyImage="/images/actions/1.svg"
        />
      }
      hasBorder
    />
  );
};

export default VouchersList;
