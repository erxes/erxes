import { useAutoAnimate } from '@formkit/auto-animate/react';
import { formatPhones } from 'erxes-ui/modules/display/utils/formatPhones';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { formatPhoneNumber } from 'erxes-ui/utils/format/formatPhoneNumber';
import { useContactFieldInput, type ContactFieldInput } from '../hooks/useContactFieldInput';
import type { IPhoneField, IPhoneFieldProps, TPhones } from '../types/phoneField';
import { ContactFieldOptions, ContactFieldValue } from './ContactFieldParts';
import { PhoneFieldForm } from './PhoneFieldForm';

type PhoneListProps = {
  phones: TPhones;
  onValueChange: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
  input: ContactFieldInput;
};

const PhoneRow = ({
  item,
  phones,
  onValueChange,
  onValidationStatusChange,
  input,
}: PhoneListProps & { item: IPhoneField }) => {
  const others = phones.filter((other) => other.phone !== item.phone);

  return (
    <div className="flex items-center overflow-hidden gap-1 w-full">
      <ContactFieldValue
        text={formatPhoneNumber({ value: item.phone ?? '' })}
        status={item.status}
        isPrimary={item.isPrimary}
      />
      <ContactFieldOptions
        kind="phone"
        isPrimary={item.isPrimary}
        status={item.status}
        showVerification
        onSetPrimary={() =>
          onValueChange([
            { ...item, isPrimary: true },
            ...others.map((other) => ({ ...other, isPrimary: false })),
          ])
        }
        onEdit={() => input.startEditing(item.phone ?? '')}
        onDelete={() => onValueChange(others)}
        onStatusChange={(status) => onValidationStatusChange?.(status)}
      />
    </div>
  );
};

const PhoneList = (props: PhoneListProps) => {
  const [animationParent] = useAutoAnimate();

  return (
    <div className="p-1 space-y-1">
      <div ref={animationParent} className="space-y-1">
        {props.phones.map(
          (item) => item.phone && <PhoneRow key={item.phone} item={item} {...props} />,
        )}
      </div>
    </div>
  );
};

/** Back to the stored shape: the primary phone and its status, then the other numbers. */
const toPhoneFieldProps = (values: TPhones): IPhoneFieldProps => {
  const primary = values.find((item) => item.isPrimary);

  return {
    primaryPhone: primary?.phone ?? '',
    phones: values.flatMap((item) => (!item.isPrimary && item.phone ? [item.phone] : [])),
    phoneValidationStatus: primary && (primary.status ?? ValidationStatus.Invalid),
  };
};

const PhoneFieldBody = ({ phones, ...props }: Omit<PhoneListProps, 'input'>) => {
  const input = useContactFieldInput(phones.some((item) => item.phone));

  return (
    <>
      <PhoneList phones={phones} input={input} {...props} />
      <PhoneFieldForm
        key={input.editing ?? ''}
        phones={phones}
        onValueChange={props.onValueChange}
        input={input}
      />
    </>
  );
};

type PhoneFieldProps = IPhoneFieldProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    /** The record the phones belong to; another record starts with the input closed. */
    recordId: string;
    onValueChange: (values: IPhoneFieldProps) => void;
    onValidationStatusChange?: (status: ValidationStatus) => void;
  };

/** A record's phones: the list with a menu per phone, and an input to add or edit one. */
export const PhoneField = ({
  ref,
  recordId,
  onValueChange,
  onValidationStatusChange,
  primaryPhone,
  phones,
  phoneValidationStatus,
  ...props
}: PhoneFieldProps & React.RefAttributes<HTMLDivElement>) => (
  <div ref={ref} {...props}>
    <PhoneFieldBody
      key={recordId}
      phones={formatPhones(primaryPhone, phones, phoneValidationStatus)}
      onValueChange={(values) => onValueChange(toPhoneFieldProps(values))}
      onValidationStatusChange={onValidationStatusChange}
    />
  </div>
);
