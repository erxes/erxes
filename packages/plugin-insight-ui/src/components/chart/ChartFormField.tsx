import React, { useEffect, useState } from "react";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateRange from "../utils/DateRange";
import { IFieldLogic } from "../../types";
import { IFilterType } from "../../containers/chart/ChartFormField";
import { MarginY } from "../../styles";
import Select from "react-select";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import SelectClientPortal from "../utils/SelectClientPortal";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectLeads from "../utils/SelectLeads";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { SelectWithAssets } from "../utils/SelectAssets";

type Props = {
  fieldType: string;
  fieldQuery: string;
  multi?: boolean;
  fieldLabel: string;
  fieldOptions: any[];
  initialValue?: any;
  onChange: (input: any) => void;
  setFilter?: (fieldName: string, value: any) => void;
  startDate?: Date;
  endDate?: Date;
  fieldValues?: any;
  fieldLogics?: IFieldLogic[];
  fieldDefaultValue?: any;
  filterType: IFilterType;
};
const ChartFormField = (props: Props) => {
  const {
    fieldQuery,
    fieldType,
    fieldOptions,
    fieldLabel,
    fieldLogics,
    initialValue,
    multi,
    onChange,
    setFilter,
    startDate,
    endDate,
    fieldValues,
    fieldDefaultValue,
    filterType,
  } = props;

  const { fieldQueryVariables } = filterType;

  useEffect(() => {
    if (!fieldValue && fieldDefaultValue) {
      setFieldValue(fieldDefaultValue);
      onChange(fieldDefaultValue);
    }
  }, [fieldDefaultValue]);

  const [fieldValue, setFieldValue] = useState(initialValue);

  const onSelect = (selectedOption) => {
    if (selectedOption === undefined || selectedOption === null) {
      setFieldValue("");
      onChange("");
    }

    if (multi && Array.isArray(selectedOption)) {
      const selectedValues = (selectedOption || []).map(
        (option) => option.value
      );
      setFieldValue(selectedValues);

      onChange(selectedValues);
    } else {
      const selectedValue = selectedOption.value;

      setFieldValue(selectedValue);
      onChange(selectedValue);
    }
  };

  const onSaveDateRange = (dateRange: any) => {
    const { startDate, endDate } = dateRange;

    if (setFilter) {
      setFilter("startDate", startDate);
      setFilter("endDate", endDate);
    }
  };

  const OnSaveBrands = (brandIds: string[] | string) => {
    if (setFilter) {
      setFilter("brandIds", brandIds);
    }
  };
  let onlyOptions = [] as any;
  Object.keys(fieldOptions[0] || []).indexOf("options") > 0 &&
    fieldOptions.map((pp) => pp.options.map((o) => onlyOptions.push(o)));
  const valueOptions =
    fieldValue &&
    (Object.keys(fieldOptions[0] || []).indexOf("options") > 0
      ? multi
        ? onlyOptions.filter((o) => fieldValue.includes(o.value))
        : onlyOptions.find((o) => o.value === fieldValue)
      : multi
        ? fieldOptions.filter((o) => fieldValue.includes(o.value))
        : fieldOptions.find((o) => o.value === fieldValue));

  switch (fieldQuery) {
    case "users":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectTeamMembers
            multi={multi}
            name="chartAssignedUserIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case "departments":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectDepartments
            multi={multi}
            filterParams={{ withoutUserFilter: true }}
            name="chartAssignedDepartmentIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case "branches":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectBranches
            multi={multi}
            filterParams={{ withoutUserFilter: true }}
            name="chartAssignedBranchIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case "brands":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectBrands
            multi={true}
            name="selectedBrands"
            label={"Choose brands"}
            onSelect={OnSaveBrands}
            initialValue={fieldValue}
          />
        </div>
      );
    case "forms":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>

          <SelectLeads
            multi={true}
            name="selecteForms"
            label={"Choose forms"}
            onSelect={onChange}
            initialValue={fieldValue}
            filterParams={JSON.parse(fieldQueryVariables)}
          />
        </div>
      );
    case "clientPortalGetConfigs":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>

          <SelectClientPortal
            multi={true}
            name="selectePortal"
            label={"Choose portal"}
            onSelect={onChange}
            initialValue={fieldValue}
            filterParams={JSON.parse(fieldQueryVariables)}
          />
        </div>
      );
    case "assets":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectWithAssets
            label="Choose Asset"
            name="assets"
            multi={multi}
            initialValue={fieldValue}
            onSelect={onChange}
          />
        </div>
      );
    case "companies":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectCompanies
            label="Select companies"
            name="companyId"
            multi={multi}
            initialValue={fieldValue}
            onSelect={onChange}
          />
        </div>
      );
    case "customers":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectCustomers
            label="Select customers"
            name="customerId"
            multi={multi}
            initialValue={fieldValue}
            onSelect={onChange}
          />
        </div>
      );
    case "products":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectProducts
            label="Select products"
            name="productId"
            multi={multi}
            initialValue={fieldValue}
            onSelect={onChange}
          />
        </div>
      );
    case "date":
      return (
        <>
          <div>
            <ControlLabel>{fieldLabel}</ControlLabel>
            <Select
              value={fieldOptions.find((o) => o.value === fieldValue)}
              onChange={onSelect}
              options={fieldOptions}
              isClearable={true}
              placeholder={fieldLabel}
            />
          </div>
          {fieldValue === "customDate" && (
            <MarginY margin={15}>
              <DateRange
                showTime={false}
                onSaveButton={onSaveDateRange}
                startDate={startDate}
                endDate={endDate}
              />
            </MarginY>
          )}
        </>
      );

    default:
      break;
  }

  switch (fieldType) {
    case "select":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>
          <Select
            value={valueOptions}
            isClearable={true}
            isMulti={multi}
            onChange={onSelect}
            options={fieldOptions}
            placeholder={fieldLabel}
          />
        </div>
      );
    default:
      return <></>;
  }
};

export default ChartFormField;
