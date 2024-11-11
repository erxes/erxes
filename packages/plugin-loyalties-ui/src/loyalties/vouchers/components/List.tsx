import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
} from "@erxes/ui/src/components";
import {
  MainStyleCount as Count,
  MainStyleTitle as Title,
} from "@erxes/ui/src/styles/eindex";
import { IQueryParams } from "@erxes/ui/src/types";

import { BarItems } from "@erxes/ui/src/layout/styles";
import { IVoucher } from "../types";
import { IVoucherCampaign } from "../../../configs/voucherCampaign/types";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, {useState} from "react";
import Sidebar from "./Sidebar";
import VoucherForm from "../containers/Form";
import VoucherRow from "./Row";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  vouchers: IVoucher[];
  currentCampaign?: IVoucherCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IVoucher[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeVouchers: (
    doc: { voucherIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: IQueryParams;
}

const VouchersList=(props: IProps) => {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue)
  const location = useLocation();
  const navigate = useNavigate();
  
  const onChange = () => {
    const { toggleAll, vouchers } = props;
    toggleAll(vouchers, "vouchers");
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue( searchValue );
    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const removeVouchers = (vouchers) => {
    const voucherIds: string[] = [];

    vouchers.forEach((voucher) => {
      voucherIds.push(voucher._id);
    });

    props.removeVouchers({ voucherIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

    const {
      vouchers,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCampaign,
    } = props;

    const renderCheckbox = () => {
      if (
        !currentCampaign ||
        ["spin", "lottery"].includes(currentCampaign.voucherType)
      ) {
        return;
      }
      return (
        <th>
          <FormControl
            checked={isAllSelected}
            componentclass="checkbox"
            onChange={onChange}
          />
        </th>
      );
    };

    const mainContent = (
      <LoyaltiesTableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              {renderCheckbox()}
              <th>
                <SortHandler sortField={"createdAt"} label={__("Created")} />
              </th>
              <th>
                <SortHandler sortField={"ownerType"} label={__("Owner Type")} />
              </th>
              <th>
                <SortHandler sortField={"ownerId"} label={__("Owner")} />
              </th>
              <th>
                <SortHandler sortField={"status"} label={__("Status")} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="vouchers">
            {vouchers.map((voucher) => (
              <VoucherRow
                voucher={voucher}
                isChecked={bulk.includes(voucher)}
                key={voucher._id}
                toggleBulk={toggleBulk}
                currentCampaign={currentCampaign}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </LoyaltiesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add voucher
      </Button>
    );

    const voucherForm = (props) => {
      return <VoucherForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              removeVouchers(bulk);
            })
            .catch((error) => {
              Alert.error(error.message);
            });

        return (
          <BarItems>
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={onClick}
            >
              Delete
            </Button>
          </BarItems>
        );
      }
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
            title={__("New voucher")}
            trigger={addTrigger}
            autoOpenKey="showVoucherModal"
            content={voucherForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign &&
          `${currentCampaign.voucherType}: ${currentCampaign.title}`) ||
          "All voucher campaigns"}{" "}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Vouchers`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
          />
        }
        content={
          <>
            <Count>
              {totalCount} voucher{totalCount > 1 && "s"}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={vouchers.length}
              emptyText="Add in your first voucher!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  
}

export default VouchersList;
