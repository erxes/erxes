import { ORGANIZATION_TYPE, menuContracts } from "../../../constants";
import React, { useRef, useState } from "react";

import Alert from "@erxes/ui/src/utils/Alert";
import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import ClassificationForm from "../../containers/ClassificationForm";
import ContractForm from "../../containers/ContractForm";
import ContractRow from "./ContractRow";
import { ContractsTableWrapper } from "../../styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IContract } from "../../types";
import { IUser } from "@erxes/ui/src/auth/types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import RightMenu from "./RightMenu";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { can } from "@erxes/ui/src/utils/core";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import withConsumer from "../../../withConsumer";
import { useNavigate } from "react-router-dom";


type ContractAlert = { name: string; count: number; filter: any };
interface IProps {
  contracts: IContract[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IContract[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeContracts: (
    doc: { contractIds: string[] },
    emptyBulk: () => void
  ) => void;
  // mergeContracts: () => void;
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  currentUser: IUser;
  alerts: ContractAlert[];
}

const ContractsList = (props: IProps) => {
  const [searchValue, setSearchValue] = useState<string>(props.searchValue);
  const timerRef = useRef<number | null>(null);
  const {
    contracts,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    // mergeContracts,
    queryParams,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    currentUser,
    alerts,
    toggleAll,
  } = props;
  const navigate = useNavigate();

  const onChange = () => {
    toggleAll(contracts, "contracts");
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = setTimeout(() => {
      navigate(`/erxes-plugin-loan/contract-list?searchValue=${value}`);
    }, 500);
  };

  const removeContracts = (contracts) => {
    const contractIds: string[] = [];

    contracts.forEach((contract) => {
      contractIds.push(contract._id);
    });

    props.removeContracts({ contractIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const mainContent = (
    <ContractsTableWrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $striped={true}
      >
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler sortField={"type"} label={__("Type")} />
            </th>
            <th>
              <SortHandler
                sortField={"contractType"}
                label={__("Contract Type")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"classification"}
                label={__("Classification")}
              />
            </th>
            <th>
              <SortHandler sortField={"number"} label={__("Contract Number")} />
            </th>
            <th>
              <SortHandler sortField={"firstName"} label={__("First Name")} />
            </th>
            <th>
              <SortHandler sortField={"code"} label={__("Code")} />
            </th>
            <th>
              <SortHandler
                sortField={"loanBalanceAmount"}
                label={__("Loan Balance")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"leaseAmount"}
                label={__("leaseAmount")}
              />
            </th>

            <th>
              <SortHandler sortField={"tenor"} label={__("Tenor")} />
            </th>
            <th>
              <SortHandler
                sortField={"interestRate"}
                label={__("Interest Rate")}
              />
            </th>
            <th>
              <SortHandler sortField={"repayment"} label={__("Repayment")} />
            </th>

            <th>
              <SortHandler
                sortField={"scheduleDays"}
                label={__("Schedule Day")}
              />
            </th>
            <th>
              <SortHandler sortField={"tenor"} label={__("Status")} />
            </th>
            <th />
          </tr>
        </thead>
        <tbody id="contracts">
          {contracts.map((contract) => (
            <ContractRow
              contract={contract}
              isChecked={bulk.includes(contract)}
              key={contract._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ContractsTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add contract")}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeContracts(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    const classificationForm = (props) => {
      return <ClassificationForm {...props} contracts={bulk} />;
    };

    actionBarLeft = (
      <BarItems>
        <ModalTrigger
          title={`${__("Change classification")}`}
          trigger={
            <Button btnStyle="warning" icon="cancel-1">
              {__("Change classification")}
            </Button>
          }
          autoOpenKey="showTransactionModal"
          size="lg"
          content={classificationForm}
          backDrop="static"
        />
        {currentUser?.configs?.loansConfig?.organizationType ===
          ORGANIZATION_TYPE.ENTITY &&
          can("contractsRemove", currentUser) && (
            <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
              {__("Delete")}
            </Button>
          )}
        {alerts.map((mur) => (
          <Button key={mur.name} onClick={() => onSelect(mur.filter, "ids")}>
            {mur.name}:{mur.count}
          </Button>
        ))}
      </BarItems>
    );
  } else {
    actionBarLeft = (
      <BarItems>
        {alerts.map((mur) => (
          <Button key={mur.name} onClick={() => onSelect(mur.filter, "ids")}>
            {mur.name}:{mur.count}
          </Button>
        ))}
      </BarItems>
    );
  }

  const contractForm = (props) => {
    return <ContractForm {...props} queryParams={queryParams} />;
  };

  const rightMenuProps = {
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    queryParams,
  };

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
      {can("contractsAdd", currentUser) && (
        <ModalTrigger
          title={`${__("New contract")}`}
          trigger={addTrigger}
          autoOpenKey="showContractModal"
          size="xl"
          content={contractForm}
          backDrop="static"
        />
      )}
      <RightMenu {...rightMenuProps} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Contracts`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser)
          )}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      hasBorder={true}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={contracts.length}
          emptyText={__("Add in your first contract!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(ContractsList);