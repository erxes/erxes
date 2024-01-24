import SelectTags from '@erxes/ui-tags/src/containers/SelectTags';
import { ControlLabel, SelectTeamMembers } from '@erxes/ui/src';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import DateRange from '../datepicker/DateRange';
import { MarginY } from '../../styles';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';

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
};
const ChartFormField = (props: Props) => {
  const {
    fieldQuery,
    fieldType,
    fieldOptions,
    fieldLabel,
    initialValue,
    multi,
    onChange,
    setFilter,
    startDate,
    endDate,
  } = props;
  const [fieldValue, setFieldValue] = useState(initialValue);

  const isArrayObjects = (arr) => {
    return arr.every(
      (element) => typeof element === 'object' && element !== null,
    );
  };

  const onSelect = (e) => {
    if (multi && isArrayObjects(e)) {
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
      setFilter('startDate', startDate);
      setFilter('endDate', endDate);
    }
  };

  const OnSaveBrands = (brandIds: string[] | string) => {
    if (setFilter) {
      setFilter('brandIds', brandIds);
    }
  };

  switch (fieldQuery) {
    case 'users':
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

    case 'departments':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectDepartments
            multi={multi}
            name="chartAssignedDepartmentIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case 'tags':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectTags
            tagsType="reports:reports"
            multi={multi}
            name="chartTags"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case 'branches':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectBranches
            multi={multi}
            name="chartAssignedBranchIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case 'brands':
      return (
        <div>
          <ControlLabel> {fieldLabel}</ControlLabel>
          <SelectBrands
            label={'Choose brands'}
            onSelect={OnSaveBrands}
            multi={true}
            name="selectedBrands"
          />
        </div>
      );
    case 'date':
      return (
        <>
          <div>
            <ControlLabel>{fieldLabel}</ControlLabel>
            <Select
              value={fieldValue}
              onChange={onSelect}
              options={fieldOptions}
              placeholder={fieldLabel}
            />
          </div>
          {fieldValue === 'customDate' && (
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
    case 'select':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>
          <Select
            value={fieldValue}
            multi={multi}
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
