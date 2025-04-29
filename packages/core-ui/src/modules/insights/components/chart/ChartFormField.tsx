import React, { useEffect, useRef, useState } from "react";

import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import { FormControl } from "@erxes/ui/src/components/form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Select from "react-select";
import { IFilterType } from "../../containers/chart/ChartFormField";
import { ControlRange } from "../../styles";
import { IFieldLogic } from "../../types";
import { generateInitialOptions } from "../../utils";
import CustomSelect from "../utils/CustomSelect";
import SelectClientPortal from "../utils/SelectClientPortal";
import SelectDate from "../utils/SelectDate";

type Props = {
  fieldType: string;
  fieldQuery: string;
  multi?: boolean;
  fieldLabel: string;
  fieldOptions: any[];
  subOptions?: any[];
  initialValue?: any;
  fieldAttributes?: any[];
  onChange: (input: any, name?: string) => void;
  onInputChange: (searchValue: string) => void;
  setFilter?: (fieldName: string, value: any) => void;
  startDate?: Date;
  endDate?: Date;
  fieldValues?: any;
  fieldLogics?: IFieldLogic[];
  fieldDefaultValue?: any;
  filterType: IFilterType;
  fieldValueOptions?: any[];
};

const ChartFormField = (props: Props) => {
  const {
    fieldQuery,
    fieldType,
    fieldOptions,
    subOptions,
    fieldLabel,
    fieldAttributes,
    initialValue,
    multi,
    onChange,
    onInputChange,
    setFilter,
    startDate,
    endDate,
    fieldValues,
    fieldDefaultValue,
    filterType,
    fieldValueOptions,
  } = props;

  const { fieldQueryVariables } = filterType;

  const timerRef = useRef<number | null>(null);

  const [fieldValue, setFieldValue] = useState(initialValue);

  useEffect(() => {
    if (!fieldValue && fieldDefaultValue) {
      setFieldValue(fieldDefaultValue);
      onChange(fieldDefaultValue);
    }
  }, [fieldDefaultValue]);

  const onSelect = (selectedOption: any, value?: string) => {
    if (selectedOption === undefined || selectedOption === null) {
      setFieldValue("");
      onChange("");

      return;
    }

    if (multi && Array.isArray(selectedOption)) {
      const selectedValues = (selectedOption || []).map(
        (option) => option.value
      );

      const modifiedOptions = value
        ? selectedOption.map(({ [value]: ommited, ...rest }) => rest)
        : selectedValues;

      setFieldValue(modifiedOptions);
      onChange(modifiedOptions);

      return;
    }

    const selectedValue = selectedOption.value;

    setFieldValue(selectedValue);
    onChange(selectedValue);
  };

  const handleDateRange = (dateRange: any) => {
    const { startDate, endDate } = dateRange;

    if (setFilter && startDate && endDate) {
      setFilter("startDate", startDate);
      setFilter("endDate", endDate);
    }
  };

  const handleInput = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { name, value } = e.target;

    const newFieldValues = fieldValue ? { ...fieldValue } : {};
    newFieldValues[name] = value;

    setFieldValue(newFieldValues);

    timerRef.current = window.setTimeout(() => {
      onChange(newFieldValues);
    }, 500);
  };

  const handleSelectInput = (value) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      onInputChange(value);
    }, 500);
  };

  switch (fieldQuery) {
    case "users":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectTeamMembers
            multi={multi}
            name="userIds"
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
            name="departmentIds"
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
            name="branchIds"
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
            name="brandIds"
            label={"Choose brands"}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );
    case "clientPortalGetConfigs":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>

          <SelectClientPortal
            multi={true}
            name="portalIds"
            label={"Choose portal"}
            onSelect={onChange}
            initialValue={fieldValue}
            filterParams={JSON.parse(fieldQueryVariables)}
          />
        </div>
      );
    case "companies":
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectCompanies
            label="Select companies"
            name="companyIds"
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
            name="customerIds"
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
            name="productIds"
            multi={multi}
            initialValue={fieldValue}
            onSelect={onChange}
          />
        </div>
      );
    case "date":
      return (
        <SelectDate
          fieldLabel={fieldLabel}
          fieldValue={fieldValue}
          fieldOptions={fieldOptions}
          onSelect={onSelect}
          startDate={startDate}
          endDate={endDate}
          onSaveButton={handleDateRange}
        />
      );

    default:
      break;
  }

  const renderSubSelect = () => {
    if (!subOptions?.length) {
      return <></>;
    }

    return (
      <div>
        <ControlLabel>{`${fieldLabel} Options`}</ControlLabel>
        <Select
          value={generateInitialOptions(subOptions, fieldValues["subFields"])}
          isMulti={true}
          options={subOptions}
          onChange={(selectedOptions: any) => {
            const values = Array.isArray(selectedOptions)
              ? selectedOptions.map((option) => option.value)
              : selectedOptions.value;

            onChange(values, "subFields");
          }}
          onInputChange={handleSelectInput}
        />
      </div>
    );
  };

  switch (fieldType) {
    case "select":
      return (
        <>
          <div>
            <ControlLabel>{fieldLabel}</ControlLabel>
            <CustomSelect
              initialValue={generateInitialOptions(fieldOptions, fieldValue)}
              value={fieldValue}
              multi={multi}
              onSelect={onSelect}
              onInputChange={handleSelectInput}
              options={fieldOptions}
              fieldLabel={fieldLabel}
              fieldValueOptions={fieldValueOptions}
            />
          </div>
          {renderSubSelect()}
        </>
      );
    case "input":
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>
          <ControlRange>
            {fieldAttributes?.map((attributes, index) => (
              <FormControl
                value={fieldValue?.[attributes.name]}
                onChange={(e) => handleInput(e)}
                {...attributes}
              />
            ))}
          </ControlRange>
        </div>
      );
    default:
      return <></>;
  }
};

export default ChartFormField;
