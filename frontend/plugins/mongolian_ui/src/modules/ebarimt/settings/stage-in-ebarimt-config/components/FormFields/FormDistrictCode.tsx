import { Form, Input } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useEffect } from 'react';

interface FormDistrictCodeProps {
  name: string;
  label: string;
  placeholder?: string;
  control: Control<any>;
  branchCode: string;
  subBranchCode: string;
  setValue?: (name: string, value: any) => void;
}

export const FormDistrictCode = ({
  name,
  label,
  placeholder,
  control,
  branchCode,
  subBranchCode,
  setValue,
}: FormDistrictCodeProps) => {
  useEffect(() => {
    if (setValue) {
      if (branchCode && subBranchCode) {
        const districtCode = `${branchCode}${subBranchCode}`;
        setValue(name, districtCode);
      } else {
        setValue(name, '');
      }
    }
  }, [branchCode, subBranchCode, name, setValue]);

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input {...field} placeholder={placeholder || label} readOnly />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
