import { Form, Input } from 'erxes-ui';
import {
  Control,
  FieldPath,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form';
import { useEffect } from 'react';

interface FormDistrictCodeProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  control: Control<T>;
  branchCode: string;
  subBranchCode: string;
  setValue?: UseFormSetValue<T>;
  /**
   * When true (default), the district code is reactively derived from
   * branchCode + subBranchCode via an effect. Consumers that re-render often
   * (e.g. the stage config with its board/pipeline/stage selects) should pass
   * false and derive the code imperatively in their sub-province handler, so
   * the effect does not keep overwriting the field on every re-render.
   */
  autoDerive?: boolean;
}

export const FormDistrictCode = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  branchCode,
  subBranchCode,
  setValue,
  autoDerive = true,
}: FormDistrictCodeProps<T>) => {
  useEffect(() => {
    if (autoDerive && setValue && branchCode && subBranchCode) {
      const districtCode = `${branchCode}${subBranchCode}`;
      setValue(name, districtCode);
    }
  }, [autoDerive, branchCode, subBranchCode, name, setValue]);

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input {...field} placeholder={placeholder || label} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
