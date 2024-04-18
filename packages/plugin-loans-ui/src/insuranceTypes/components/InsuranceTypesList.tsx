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
} from "@erxes/ui/src";
import React, { useRef, useState } from "react";

import { IInsuranceType } from "../types";
import InsuranceTypeForm from "../containers/InsuranceTypeForm";
import InsuranceTypeRow from "./InsuranceTypeRow";
import { InsuranceTypesTableWrapper } from "../styles";
import { __ } from "coreui/utils";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { useNavigate } from 'react-router-dom';

interface IProps {
  insuranceTypes: IInsuranceType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IInsuranceType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeInsuranceTypes: (
    doc: { insuranceTypeIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
}

const InsuranceTypesList = (props: IProps) => {
  const timerRef = useRef<number | null>(null);
  const {
    insuranceTypes,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    toggleAll,
  } = props;

  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState(props.searchValue);

  const onChange = () => {
    toggleAll(insuranceTypes, "insuranceTypes");
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

  const removeInsuranceTypes = (insuranceTypes) => {
    const insuranceTypeIds: string[] = [];

    insuranceTypes.forEach((insuranceType) => {
      insuranceTypeIds.push(insuranceType._id);
    });

    props.removeInsuranceTypes({ insuranceTypeIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const mainContent = (
    <InsuranceTypesTableWrapper>
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
              <SortHandler sortField={"code"} label={__("Code")} />
            </th>
            <th>
              <SortHandler sortField={"name"} label={__("Name")} />
            </th>
            <th>{__("Company Code")}</th>
            <th>{__("Company Name")}</th>
            <th>{__("Percent")}</th>
            <th>{__("Year Percents")}</th>
            <th>
              <SortHandler
                sortField={"description"}
                label={__("Description")}
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody id="insuranceTypes">
          {insuranceTypes.map((insuranceType) => (
            <InsuranceTypeRow
              insuranceType={insuranceType}
              isChecked={bulk.includes(insuranceType)}
              key={insuranceType._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </InsuranceTypesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add insuranceType")}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeInsuranceTypes(bulk);
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

  const insuranceTypeForm = (props) => {
    return <InsuranceTypeForm {...props} queryParams={queryParams} />;
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
        title={__("New insuranceType")}
        trigger={addTrigger}
        autoOpenKey="showInsuranceTypeModal"
        content={insuranceTypeForm}
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
          title={__(`InsuranceTypes`) + ` (${totalCount})`}
          queryParams={queryParams}
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Insurance type") },
          ]}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={insuranceTypes.length}
          emptyText="Add in your first insuranceType!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default InsuranceTypesList;
