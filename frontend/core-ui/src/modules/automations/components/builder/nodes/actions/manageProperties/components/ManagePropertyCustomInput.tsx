import {
  unwrapToken,
  wrapToken,
} from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyCustomInput';
import { TPropertyInputMeta, TPropertyInputProps } from 'erxes-ui';
import { ComponentType } from 'react';

export const ManagePropertyCustomInput = ({
  CustomInput,
  value,
  onChange,
  meta,
  onMetaChange,
  disabled,
}: {
  CustomInput: ComponentType<TPropertyInputProps>;
  value?: string;
  onChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
}) => {
  return (
    <CustomInput
      value={unwrapToken(value)}
      onValueChange={(next) => onChange(wrapToken(next))}
      meta={meta}
      onMetaChange={onMetaChange}
      disabled={disabled}
    />
  );
};
