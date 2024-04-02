import {
  Alert,
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  confirm,
} from "@erxes/ui/src";
import React, { useRef, useState } from "react";

import ContractForm from "../../containers/ContractForm";
// import ContractsMerge from '../detail/ContractsMerge';
import ContractRow from "./ContractRow";
import { ContractsTableWrapper } from "../../styles";
import { IContract } from "../../types";
import { IUser } from "@erxes/ui/src/auth/types";
import RightMenu from "./RightMenu";
import { __ } from "coreui/utils";
import { can } from "@erxes/ui/src/utils/core";
import { menuContracts } from "../../../constants";
import withConsumer from "../../../withConsumer";
import { useNavigate } from "react-router-dom";

// import Sidebar from './Sidebar';

type SavingAlert = { name: string; count: number; filter: any };
interface IProps {
  contracts: IContract[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
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
  alerts: SavingAlert[];
}

const ContractsList = (props: IProps) => {
  const navigate = useNavigate();

  const timerRef = useRef<number | undefined>(undefined);

  const [searchValue, setSearchValue] = useState(props.searchValue);

  const onChange = () => {
    const { toggleAll, contracts } = props;
    toggleAll(contracts, "contracts");
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = setTimeout(() => {
      navigate(`/settings/contract-types?searchValue=${value}`);
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
  } = props;

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
              <SortHandler sortField={"number"} label={__("Contract Number")} />
            </th>
            <th>
              <SortHandler sortField={"First Name"} label={__("First Name")} />
            </th>
            <th>
              <SortHandler sortField={"Code"} label={__("Code")} />
            </th>
            <th>
              <SortHandler
                sortField={"savingAmount"}
                label={__("Saving Amount")}
              />
            </th>
            <th>
              <SortHandler sortField={"tenor"} label={__("Status")} />
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

    actionBarLeft = (
      <BarItems>
        {can("contractsRemove", currentUser) && (
          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            {__("Delete")}
          </Button>
        )}
        {alerts.map((mur) => (
          <Button onClick={() => onSelect(mur.filter, "ids")}>
            {mur.name}:{mur.count}
          </Button>
        ))}
      </BarItems>
    );
  } else {
    actionBarLeft = (
      <BarItems>
        {alerts.map((mur) => (
          <Button onClick={() => onSelect(mur.filter, "ids")}>
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
      hasBorder
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
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={contracts.length}
          emptyText="Add in your first contract!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(ContractsList);
