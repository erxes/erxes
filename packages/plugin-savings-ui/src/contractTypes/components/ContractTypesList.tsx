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
  router,
} from "@erxes/ui/src";
import React, { useEffect, useRef, useState } from "react";

import ContractTypeForm from "../containers/ContractTypeForm";
import ContractTypeRow from "./ContractTypeRow";
import { ContractTypesTableWrapper } from "../styles";
import { IContractType } from "../types";
import { __ } from "coreui/utils";
import { useNavigate } from "react-router-dom";

interface IProps {
  contractTypes: IContractType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IContractType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeContractTypes: (
    doc: { contractTypeIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
}

const ContractTypesList = (props: IProps) => {
  const [searchValue, setSearchValue] = useState<string>(props.searchValue);
  const timerRef = useRef<number | null>(null);
  const {
    contractTypes,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    toggleAll,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setSearchValue(props.searchValue);
  }, [props.searchValue]);

  const onChange = () => {
    toggleAll(contractTypes, "contractTypes");
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

  const removeContractTypes = (contractTypes) => {
    const contractTypeIds: string[] = [];

    contractTypes.forEach((contractType) => {
      contractTypeIds.push(contractType._id);
    });

    props.removeContractTypes({ contractTypeIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const mainContent = (
    <ContractTypesTableWrapper>
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
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
              <SortHandler sortField={"code"} label={__("Code")} />
            </th>
            <th>
              <SortHandler sortField={"name"} label={__("Name")} />
            </th>
            <th>
              <SortHandler sortField={"number"} label={__("Start Number")} />
            </th>
            <th>{__("After vacancy count")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="contractTypes">
          {contractTypes.map((contractType) => (
            <ContractTypeRow
              contractType={contractType}
              isChecked={bulk.includes(contractType)}
              key={contractType._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ContractTypesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add Saving contract type")}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeContractTypes(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          {__("Delete")}
        </Button>
      </BarItems>
    );
  }

  const contractTypeForm = (props) => {
    return <ContractTypeForm {...props} queryParams={queryParams} />;
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

      <ModalTrigger
        title={__("New Saving contract type")}
        trigger={addTrigger}
        autoOpenKey="showContractTypeModal"
        size="lg"
        content={contractTypeForm}
        backDrop="static"
      />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`ContractTypes`) + ` (${totalCount})`}
          queryParams={queryParams}
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Contract Type") },
          ]}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={contractTypes.length}
          emptyText="Add in your first contractType!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default ContractTypesList;
