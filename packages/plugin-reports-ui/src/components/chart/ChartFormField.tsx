import { ControlLabel, SelectTeamMembers } from "@erxes/ui/src";
import { Alert } from "@erxes/ui/src/utils";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { MarginY } from "../../styles";
import DateRange from "../datepicker/DateRange";
import { IFieldLogic } from "../../types";

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
  } = props;

  useEffect(() => {
    if (fieldDefaultValue) {
      setFieldValue(fieldDefaultValue);
      onChange(fieldDefaultValue);
    }
  }, [fieldDefaultValue]);

  const [fieldValue, setFieldValue] = useState(initialValue);

  const onSelect = (e) => {
    if (multi && Array.isArray(e)) {
      const arr = e.map((sel) => sel.value);

      onChange(arr);
      setFieldValue(arr);
      return;
    }

    setFieldValue(e.value);
    onChange(e);
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
            value={fieldOptions.find((o) => o.value === fieldValue)}
            isMulti={multi}
            onChange={onSelect}
            options={fieldOptions}
            isClearable={true}
            placeholder={fieldLabel}
          />
        </div>
      );

    default:
      return <></>;
  }
};

export default ChartFormField;
